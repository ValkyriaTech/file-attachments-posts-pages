var wppdFileUrls = {};

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function uploadFile(singleFile) {

  let formData = new FormData();

  formData.append('file', singleFile, singleFile.name);
  formData.append('action', 'wppdUploadFile');

  let request = new XMLHttpRequest();
  request.open("POST", '//' + window.location.host + '/wp-admin/admin-ajax.php', true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {

      let resp = this.response;
      if(resp != null && resp != '') {

        wppdFileUrls[singleFile.name] = resp;

        document.getElementById('pdfFilesContainer').innerHTML += '<li class="file-item" id="attachment_' + resp + '">' +
            '<i class="far fa-file"></i>' +
            '<input class="filename-controller" data-filename="' + singleFile.name + '" type="text" value="' + singleFile.name.substring(0, 15) + ((singleFile.name.length > 15) ? '[...]' : '') + '"></input>' +
            '<div class="action-btns">' +
              '<a class="link-btn" href="' + resp + '" target="blank" rel="noopener noreferrer"><i class="fas fa-link"></i></a>' +
              '<i data-name="' + singleFile.name + '" data-url="' + resp + '" class="fas fa-times remove-btn"></i>' +
            '</div>' +
          '</li>';
        document.getElementById('wppd_pdf_file_list').value = JSON.stringify(wppdFileUrls);

      }

    } else {
      console.log('Internal Server Error!\n' + this.response);
    }
  };

  request.onerror = function() {
    console.log('Request error...');
  };

  request.send(formData);

}

docReady(function() {

  if(document.getElementById('wppd_pdf_file')) {
    let inputElement = document.getElementById('wppd_pdf_file');
    inputElement.addEventListener('change', function() {

      let singleFile = inputElement.files[0];
      uploadFile(singleFile);

    });
  }

  if(document.getElementById('wppd_pdf_file_list')) {
    let fileList = document.getElementById('wppd_pdf_file_list_value').innerHTML;
    if(fileList != null && fileList != '')
      wppdFileUrls = JSON.parse(fileList);
  }

  document.addEventListener('change', function(e) {
    for (var target = e.target; target && target != this; target = target.parentNode)
      if (target.matches('.filename-controller')) {

        wppdFileUrls[target.value] = wppdFileUrls[target.getAttribute('data-filename')];
        delete wppdFileUrls[target.getAttribute('data-filename')];

        document.getElementById('wppd_pdf_file_list').value = JSON.stringify(wppdFileUrls);
      }
  });

  document.addEventListener('click', function(e) {
    for (var target = e.target; target && target != this; target = target.parentNode)
      if (target.matches('.remove-btn')) {
        let fileName = target.getAttribute('data-name');
        let fileUrl = target.getAttribute('data-url');

        delete wppdFileUrls[fileName];
        let fileItem = document.getElementById('attachment_' + fileUrl);
        fileItem.remove();

        document.getElementById('wppd_pdf_file_list').value = JSON.stringify(wppdFileUrls);
      }
  });

});
