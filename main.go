package main

import (
	"crypto/md5"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"github.com/codegangsta/negroni"
	"github.com/goincremental/negroni-sessions"
	"github.com/goincremental/negroni-sessions/cookiestore"
	"github.com/julienschmidt/httprouter"
	_ "github.com/mattn/go-sqlite3"
	sw "go-template/switcher"
	upload "go-template/upload"
	"io"
	"log"
	"net/http"
)

type Ret struct {
	Success bool        `json:"success"`
	ErrMsg  string      `json:"errMsg"`
	Data    interface{} `json:"data"`
}

func main() {
	rt := httprouter.New()
	rt.GET("/", AuthHandler)
	rt.GET("/tmpl", DlmHandler)
	rt.POST("/upload", upload.UploadHandler)

	n := negroni.Classic()

	store := cookiestore.New([]byte("session_secret"))
	n.Use(sessions.Sessions("my_session", store))

	n.UseHandler(rt)
	n.Run(":10000")
}

func AuthHandler(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
	session := sessions.GetSession(r)
	log.Println(session)
	guid := getGuid()
	session.Set("secret", guid)
	cookie := http.Cookie{Name: "secret", Value: guid}
	http.SetCookie(rw, &cookie)
	http.Redirect(rw, r, "/main.html", http.StatusSeeOther)
}

func Authorize(r *http.Request) bool {
	session := sessions.GetSession(r)
	secret := session.Get("secret")
	cookie, err := r.Cookie("secret")
	if err != nil {
		log.Println(err)
		return false
	}
	if cookie.Value != secret {
		log.Println("不匹配")
		return false
	}
	return true
}

func DlmHandler(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
	db := ConnectDB("./middle.db")

	defer func() {
		db.Close()
		err := recover()
		if err != nil {
			rw.Write(GenJsonpResult(r, &Ret{false, err.(string), nil}))
			log.Println(err)
		}
	}()

	LogClient(r.RemoteAddr, db)

	// print query string
	log.Println(r.URL.RawQuery)

	switcher := sw.Dispatch(db)
	var ret []byte
	if Authorize(r) {
		msg, data := switcher[sw.GetParameter(r, "cmd")](r)
		ret = GenJsonpResult(r, &Ret{true, msg, data})
	} else {
		panic("Not authorized!")
	}
	rw.Write(ret)
}

func GenJsonpResult(r *http.Request, rt *Ret) []byte {
	bs, err := json.Marshal(rt)
	if err != nil {
		panic(err)
	}
	return []byte(sw.GetParameter(r, "callback") + "(" + string(bs) + ")")
}

func ConnectDB(dbPath string) *sql.DB {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		panic(err)
	}
	return db
}

func LogClient(ip string, db *sql.DB) {
	// 如果没有click表，会出现pointer为nil的问题
	stmt, _ := db.Prepare("insert into clicks(ip) values(?)")
	stmt.Exec(ip)
}

// 生成随机码
func getGuid() string {
	b := make([]byte, 48)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		panic("获取随机码错误")
	}
	h := md5.New()
	h.Write([]byte(base64.URLEncoding.EncodeToString(b)))
	return hex.EncodeToString(h.Sum(nil))
}
