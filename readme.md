上传到webdav

需要ENV
WEBDAV_URL= 
WEBDAV_USERNAME= 
WEBDAV_PASSWORD=

直链下载功能还需要自建webdav的cdn解析
CDN_URL=

docker run -p 3000:3000 -e WEBDAV_URL= -e WEBDAV_USERNAME= -e WEBDAV_PASSWORD= -e CDN_URL= wrhsd/file-webdav
