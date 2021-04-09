var wppaAtachments = [];

Dropzone.autoDiscover = false;

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function getAttachmentDetails(fileUrl, fileName) {

  let dialog = document.getElementById('attachmentDialog');

  dialog.querySelector('#wppa_attachmentTitle').value = fileName;
  dialog.querySelector('#wppa_attachmentTitleShow').innerHTML = fileName;

  dialog.querySelector('#wppa_attachmentFileUrl').value = fileUrl;

  dialog.classList.add('attach-dialog-show');

}

function uploadAttachCover(singleFile) {

  let formData = new FormData();

  formData.append('file', singleFile, singleFile.name);
  formData.append('action', 'wppaUploadImage');

  let request = new XMLHttpRequest();
  request.open("POST", '//' + window.location.host + '/cogna/wp-admin/admin-ajax.php', true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {

      let resp = this.response;
      if(resp != null && resp != '') {

        document.getElementById('wppa_attachmentCoverImageShow').setAttribute('src', resp);

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

  if(fileList != null && fileList != '')
    wppaAtachments = JSON.parse(fileList);

  var attachmentDropzone = new Dropzone('div#attachmentDropzone', {
    dictDefaultMessage: 'Solte arquivos aqui',
    init: function() {
      this.on('success', function(file, response) {

        getAttachmentDetails(response, file.name);

      });
    }
  });

  if (document.getElementById('attachmentDialog')) {

    let dialog = document.getElementById('attachmentDialog');

    document.getElementById('wppa_attachmentTitle').addEventListener('change', function() {
      document.getElementById('wppa_attachmentTitleShow').innerHTML = this.value;
    });

    let inputElement = document.getElementById('wppa_attachmentCoverImage');
    inputElement.addEventListener('change', function() {

      let singleFile = inputElement.files[0];
      uploadAttachCover(singleFile);

    });

    document.getElementById('wppa_attachmentSend').addEventListener('click', function() {

      let uploadedFile = {
        name: document.getElementById('wppa_attachmentTitle').value,
        cover_image: document.getElementById('wppa_attachmentCoverImageShow').getAttribute('src'),
        url: document.getElementById('wppa_attachmentFileUrl').value
      };

      wppaAtachments.push(uploadedFile);
      document.getElementById('wppa_attachment_list').value = JSON.stringify(wppaAtachments);

      // ------- mostrar arquivos na lista --------

      dialog.classList.remove('attach-dialog-show');

    });
  }

});
