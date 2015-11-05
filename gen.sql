create table if not exists clicks (
	ip text,
	logtime datetime default (datetime('now', 'localtime'))
);
