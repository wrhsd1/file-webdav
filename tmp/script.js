document.getElementById('upload-button').addEventListener('click', function() {
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append('file', file);

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', 'https://uno.teracloud.jp/dav/imgs/' + file.name, true);
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa('wrhsd:kjLxHLMb9CK7Gi9e'));

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            document.getElementById('upload-progress').value = percentComplete;
            document.getElementById('progress-text').innerText = Math.round(percentComplete) + '%';
        }
    };

    xhr.onload = function() {
        if (xhr.status == 201) {
            document.getElementById('result-url').innerText = '上传成功: ' + xhr.responseURL;
        } else {
            document.getElementById('result-url').innerText = '上传失败';
        }
    };

    xhr.send(formData);
});
