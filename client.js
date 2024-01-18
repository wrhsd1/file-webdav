function uploadFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    var progress = document.getElementById('progress');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            progress.textContent = percentComplete + '% uploaded';
        }
    };


xhr.onload = function() {
    if (this.status == 200) {
        var resp = JSON.parse(this.response);

        var currentResultContainer = document.getElementById('currentUploadResult');
        var historyResultsContainer = document.getElementById('historyUploadResults');

        // 将之前的当前结果移动到历史结果容器
        if (currentResultContainer.innerHTML !== '') {
            historyResultsContainer.innerHTML = currentResultContainer.innerHTML + historyResultsContainer.innerHTML;
        }
        currentResultContainer.innerHTML = ''; // 清空当前结果容器
        
        console.log('Server got:', resp);

        // Create a new link element
        var linkElem = document.createElement('a');
        linkElem.href = resp.url;
        linkElem.textContent = resp.url;
        document.body.appendChild(linkElem);


        // Create a new button for copying the URL
        var copyButton = document.createElement('button');
        copyButton.textContent = 'Copy URL';
        copyButton.onclick = function() {
            var textArea = document.createElement('textarea');
            textArea.value = resp.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        };
        document.body.appendChild(copyButton);


        // Create a new button for previewing the URL
        var previewButton = document.createElement('button');
        previewButton.textContent = 'Preview URL';
        previewButton.onclick = function() {
            window.open(resp.url, '_blank');
        };
        document.body.appendChild(previewButton);

        // Add a line break
        document.body.appendChild(document.createElement('br'));
        
        currentResultContainer.appendChild(linkElem);
        currentResultContainer.appendChild(copyButton);
        currentResultContainer.appendChild(previewButton);
        currentResultContainer.appendChild(document.createElement('br'));
    } else {
        console.error('An error occurred!');
    }
};

    var formData = new FormData();
    formData.append('file', file);

    xhr.send(formData);
}