# go-template

我这儿主要的工作就是写webservice，之前用过webpy但是性能实在不是很理想，不过的确是很稳定。

这个框架，性能和速度都是不错的，主要是在negroni的基础上实现的一个webservice框架。

main.go主要集成了一个根路径的session id验证，验证成功之后自动跳转的到main.html；此外统一返回标准结构的json数据。

ajax的接口调用在tmpl路由里，会调switch.go中的逻辑，也就是说集中力量写switch就行了，其他不用管了。

经常会碰到需要上传图片的情况，因此也集成了一个upload.go配合ref.js，自动压缩为500px宽的图片并上传。

用这个模板写应用的步骤如下：

0、建立sqlite3数据库（已有的一个gen.sql提供了简单的连接记录）

1、修改mai.go里的监听端口

2、修改switch/switch.go文件中的Dispatch函数，增加业务逻辑（参照test编写即可）

3、把页面文件扔到public里，入口文件统一为main.html

4、根据接口逻辑与前端表现需要，编写前端的js逻辑
