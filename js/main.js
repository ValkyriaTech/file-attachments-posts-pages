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

function loader(elementId, action = 'start') {
  if (document.getElementById(elementId)) {
    switch (action) {
      case 'start':
        document.getElementById(elementId).innerHTML += '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        break;
      case 'stop':
        document.getElementById(elementId).querySelector('.lds-ring').remove();
        break;
    }
  }
}

function getAttachmentDetails(fileUrl, fileName, attachmentKey = null, attachmentCoverImage = null) {

  let dialog = document.getElementById('attachmentDialog');

  dialog.querySelector('#wppa_attachmentTitle').value = fileName;
  dialog.querySelector('#wppa_attachmentDescription').value = fileName;
  dialog.querySelector('#wppa_attachmentTitleShow').innerHTML = fileName;

  dialog.querySelector('#wppa_attachmentFileUrl').value = fileUrl;

  if (attachmentKey != null)
    dialog.querySelector('#wppa_attachmentSend').setAttribute('data-key', attachmentKey);

  if (attachmentCoverImage != null)
    dialog.querySelector('#wppa_attachmentCoverImageShow').setAttribute('src', attachmentCoverImage);

  dialog.classList.add('attach-dialog-show');

}

function uploadAttachCover(singleFile) {

  loader('wppa_attachmentSend');

  let formData = new FormData();

  formData.append('file', singleFile, singleFile.name);
  formData.append('action', 'wppaUploadImage');

  let request = new XMLHttpRequest();
  request.open("POST", wpApiUrl, true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {

      let resp = this.response;
      if(resp != null && resp != '') {

        document.getElementById('wppa_attachmentCoverImageShow').setAttribute('src', resp);
        loader('wppa_attachmentSend', 'stop');

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

function closeAttachmentDialog() {
  document.getElementById('wppa_attachmentSend').removeAttribute('data-key');
  document.getElementById('attachmentDialog').classList.remove('attach-dialog-show');
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
        description: document.getElementById('wppa_attachmentDescription').value,
        cover_image: document.getElementById('wppa_attachmentCoverImageShow').getAttribute('src'),
        url: document.getElementById('wppa_attachmentFileUrl').value
      };

      // editing
      if (this.getAttribute('data-key')) {
        let key = this.getAttribute('data-key');
        wppaAtachments[key] = uploadedFile;
        let attItemBlock = document.getElementById('attachment_' + key);
        attItemBlock.querySelector('span').innerHTML = uploadedFile.name;
      }
      else {
        wppaAtachments.push(uploadedFile);

        let attachmentItemBlock = '<li class="att-item" id="attachment_' + (wppaAtachments.length - 1) + '">' +
          '<span>' + uploadedFile.name + '</span>' +
          '<div class="action-btns">' +
            '<a title="Abrir" class="link-btn" href="' + uploadedFile.url + '" target="blank" rel="noopener noreferrer"><i class="fas fa-link"></i></a>' +
            '<i title="Detalhes" data-key="' + (wppaAtachments.length - 1) + '" class="fas fa-edit edit-btn"></i>' +
            '<i title="Remover" data-key="' + (wppaAtachments.length - 1) + '" class="fas fa-times remove-btn"></i>' +
          '</div>' +
        '</li>';
        document.getElementById('attachmentsContainer').innerHTML += attachmentItemBlock;
      }

      document.getElementById('wppa_attachment_list').value = JSON.stringify(wppaAtachments);

      // clear data
      closeAttachmentDialog();

    });

    document.getElementById('closeAttachmentDialog').addEventListener('click', function (){
      closeAttachmentDialog();
    });
  }

  // default click
  document.addEventListener('click', function(e) {
    for (var target = e.target; target && target != this; target = target.parentNode)
      if (target.matches('.remove-btn')) {

        wppaAtachments.splice(target.getAttribute('data-key'), 1);
        document.getElementById('wppa_attachment_list').value = JSON.stringify(wppaAtachments);
        target.parentNode.parentNode.remove();

        document.getElementById('attachmentsContainer').querySelectorAll('li').forEach((item, i) => {
          item.setAttribute('id', 'attachment_' + i);
          item.querySelector('.edit-btn').setAttribute('data-key', i);
          item.querySelector('.remove-btn').setAttribute('data-key', i);
        });


      } else if (target.matches('.edit-btn')) {

        let attachment = wppaAtachments[target.getAttribute('data-key')];
        getAttachmentDetails(attachment.url, attachment.name, target.getAttribute('data-key'), attachment.cover_image);

      }
  });

});
