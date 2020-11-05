var wppdFileUrls = [];

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

        wppdFileUrls.push(resp);
        document.getElementById('pdfFilesContainer').innerHTML += '<div class="file-item"><i class="far fa-file"></i><span>' + singleFile.name + '</span></div>';
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

});
