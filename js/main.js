var fappAtachments = [];

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

function getAttachmentDetails(fileUrl, fileName, description = null, attachmentKey = null, attachmentCoverImage = null) {

  let dialog = document.getElementById('attachmentDialog');

  dialog.querySelector('#fapp_attachmentTitle').value = fileName;
  dialog.querySelector('#fapp_attachmentDescription').value = description;
  dialog.querySelector('#fapp_attachmentTitleShow').innerHTML = fileName;

  dialog.querySelector('#fapp_attachmentFileUrl').value = fileUrl;

  if (attachmentKey != null)
    dialog.querySelector('#fapp_attachmentSend').setAttribute('data-key', attachmentKey);

  if (attachmentCoverImage != null)
    dialog.querySelector('#fapp_attachmentCoverImageShow').setAttribute('src', attachmentCoverImage);

  dialog.classList.add('attach-dialog-show');

}

function uploadAttachCover(singleFile) {

  loader('fapp_attachmentSend');

  let formData = new FormData();

  formData.append('file', singleFile, singleFile.name);
  formData.append('action', 'fappUploadImage');

  let request = new XMLHttpRequest();
  request.open("POST", wpApiUrl, true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {

      let resp = this.response;
      if(resp != null && resp != '') {

        document.getElementById('fapp_attachmentCoverImageShow').setAttribute('src', resp);
        loader('fapp_attachmentSend', 'stop');

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
  document.getElementById('fapp_attachmentSend').removeAttribute('data-key');
  document.getElementById('attachmentDialog').classList.remove('attach-dialog-show');
}

docReady(function() {

  if(fileList != null && fileList != '')
    fappAtachments = JSON.parse(fileList);

  var attachmentDropzone = new Dropzone('div#attachmentDropzone', {
    dictDefaultMessage: 'Drop files here',
    init: function() {
      this.on('success', function(file, response) {

        getAttachmentDetails(response, file.name);

      });
    }
  });

  let dialog = document.getElementById('attachmentDialog');
  if (dialog) {

    document.getElementById('fapp_attachmentTitle').addEventListener('change', function() {
      document.getElementById('fapp_attachmentTitleShow').innerHTML = this.value;
    });

    let inputElement = document.getElementById('fapp_attachmentCoverImage');
    inputElement.addEventListener('change', function() {

      let singleFile = inputElement.files[0];
      uploadAttachCover(singleFile);

    });

    document.getElementById('fapp_attachmentSend').addEventListener('click', function() {

      let uploadedFile = {
        name: document.getElementById('fapp_attachmentTitle').value,
        description: document.getElementById('fapp_attachmentDescription').value,
        cover_image: document.getElementById('fapp_attachmentCoverImageShow').getAttribute('src'),
        url: document.getElementById('fapp_attachmentFileUrl').value
      };

      // editing
      if (this.getAttribute('data-key')) {

        let key = this.getAttribute('data-key');
        fappAtachments[key] = uploadedFile;
        console.log(key);
        let attItemBlock = document.getElementById('attachment_' + key);
        console.log(attItemBlock);
        attItemBlock.querySelector('span').innerHTML = uploadedFile.name;

      } else {
        fappAtachments.push(uploadedFile);

        let attachmentItemBlock = '<li class="att-item" id="attachment_' + (fappAtachments.length - 1) + '">' +
          '<span>' + uploadedFile.name + '</span>' +
          '<div class="action-btns">' +
            '<a title="Open" class="link-btn" href="' + uploadedFile.url + '" target="blank" rel="noopener noreferrer"><i>🔗</i></a>' +
            '<i title="Details" data-key="' + (fappAtachments.length - 1) + '" class="edit-btn">&#128393;</i>' +
            '<i title="Remove" data-key="' + (fappAtachments.length - 1) + '" class="remove-btn">✖</i>' +
          '</div>' +
        '</li>';
        document.getElementById('attachmentsContainer').innerHTML += attachmentItemBlock;
      }

      document.getElementById('fapp_attachment_list').value = JSON.stringify(fappAtachments);

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

        fappAtachments.splice(target.getAttribute('data-key'), 1);
        document.getElementById('fapp_attachment_list').value = JSON.stringify(fappAtachments);
        target.parentNode.parentNode.remove();

        document.getElementById('attachmentsContainer').querySelectorAll('li').forEach((item, i) => {
          item.setAttribute('id', 'attachment_' + i);
          item.querySelector('.edit-btn').setAttribute('data-key', i);
          item.querySelector('.remove-btn').setAttribute('data-key', i);
        });


      } else if (target.matches('.edit-btn')) {

        let attachment = fappAtachments[target.getAttribute('data-key')];
        getAttachmentDetails(attachment.url, attachment.name, attachment.description, target.getAttribute('data-key'), attachment.cover_image);

      }
  });

});
