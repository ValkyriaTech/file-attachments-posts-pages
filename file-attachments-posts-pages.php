<?php

  /*
  * Plugin Name: File Attachments for Posts & Pages
  * Plugin URI: https://github.com/ValkyriaTech/file-attachments-posts-pages/
  * Description: This plugin will add a custom metabox controller to attach document files to posts & pages
  * Version: 2.2.1
  * Author: ValkyriaTech
  * Author URI: https://github.com/ValkyriaTech
  * License: GPLv3
  * License URI: https://www.gnu.org/licenses/gpl-3.0.pt-br.html
  */

  function loadPdfFilesBox() {

    wp_enqueue_script(
      'dropzone',
      plugin_dir_url(__FILE__) . 'js/dropzone.min.js',
      null,
      true
    );

    wp_enqueue_script(
      'main',
      plugin_dir_url(__FILE__) . 'js/main.min.js',
      null,
      '2.2.0'
    );

    wp_enqueue_style(
      'dropzone-css',
      plugin_dir_url(__FILE__) . 'css/dropzone.min.css',
      null,
      '5.7.2',
      'screen'
    );

    wp_enqueue_style(
      'style',
      plugin_dir_url(__FILE__) . 'css/style.min.css',
      null,
      '2.2.0',
      'screen'
    );

    //custom metabox
    add_meta_box(
      'fapp_attachments_block',
      'Anexos',
      'fapp_attachments_block',
      'post',
      'side'
    );

    add_meta_box(
      'fapp_attachments_block',
      'Anexos',
      'fapp_attachments_block',
      'page',
      'side'
    );

  }
  add_action('add_meta_boxes', 'loadPdfFilesBox');

  function fapp_attachments_block() {

    $attachments = get_post_meta(get_the_ID(), 'fapp_attachment_list', true) ?? '';

    $attachmentsListBlock = '';
    if(!empty($attachments)) {
      $attJson = json_decode($attachments);
      foreach ($attJson as $key => $attachment) {
        $attachmentsListBlock .= '<li class="att-item" id="attachment_' . $key . '">
          <span>' . $attachment->name . '</span>
          <div class="action-btns">
            <a title="Open" class="link-btn" href="' . $attachment->url . '" target="blank" rel="noopener noreferrer"><i>🔗</i></a>
            <i title="Details" data-key="' . $key . '" class="edit-btn">&#128393;</i>
            <i title="Remove" data-key="' . $key . '" class="remove-btn">✖</i>
          </div>
        </li>';
      }
    }

    ?>

      <div id="attachmentDialog">
        <button type="button" id="closeAttachmentDialog">
          <i class="fas fa-times"></i>
        </button>
        <div class="row">
          <div class="column">
            <h3 id="fapp_attachmentTitleShow">Attachment Cover</h3>
            <img title="Imagem de capa do anexo" id="fapp_attachmentCoverImageShow" src="<?= plugin_dir_url(__FILE__) . 'img/default.jpg' ?>" alt="Attachment Cover">
          </div>
          <div class="column">
            <h3>Detalhes do anexo:</h3>
            <input placeholder="Título" type="text" name="fapp_attachmentTitle" id="fapp_attachmentTitle">
            <br>
            <textarea placeholder="Descrição" type="text" name="fapp_attachmentDescription" id="fapp_attachmentDescription"></textarea>
            <br>
            <label for="fapp_attachmentCoverImage" class="components-button is-secondary" id="fapp_attachmentCoverImageLabel" >
              <i class="far fa-file-image"></i>
              Alterar imagem de capa
            </label>
            <input type="file" id="fapp_attachmentCoverImage" name="fapp_attachmentCoverImage" value="" size="25"/>
            <input type="hidden" name="fapp_attachmentFileUrl" id="fapp_attachmentFileUrl" value="">
            <button class="components-button is-primary" type="button" name="fapp_attachmentSend" id="fapp_attachmentSend">Salvar</button>
          </div>
        </div>
      </div>

      <div action="<?= get_site_url() . '/wp-admin/admin-ajax.php?action=fappUploadFile' ?>" id="attachmentDropzone" class="dropzone"></div>
      <ul id="attachmentsContainer"><?= $attachmentsListBlock ?></ul>
      <input type="hidden" id="fapp_attachment_list" name="fapp_attachment_list" value='<?= $attachments ?>'/>
      <script>
        var wpApiUrl = '<?= get_site_url() ?>/wp-admin/admin-ajax.php';
        var fileList = <?= (!empty($attachments) ? json_encode($attachments) : '""') ?>;
      </script>
    <?php
  }

  function fapp_metabox_save( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( $parent_id = wp_is_post_revision( $post_id ) ) {
        $post_id = $parent_id;
    }
    $fields = [
      'fapp_attachment_list'
    ];
    foreach ( $fields as $field ) {
      if ( array_key_exists( $field, $_POST ) ) {
        update_post_meta( $post_id, $field, sanitize_text_field( $_POST[$field] ) );
      }
    }
  }
  add_action('save_post', 'fapp_metabox_save');

  function fappUploadFile() {

    $attachments = $_FILES['file'];

    $supported_types = [
      'text/plain',
      'text/csv',
      'application/pdf',
      'application/vnd.oasis.opendocument.text',
      'application/msword'
    ];

    // Get the file type of the upload
    $arr_file_type = wp_check_filetype(basename($attachments['name']));
    $uploaded_type = $arr_file_type['type'];

    // Check if the type is supported. If not, throw an error.
    if(in_array($uploaded_type, $supported_types)) {

      // Use the WordPress API to upload the file
      $upload = wp_upload_bits($attachments['name'], null, file_get_contents($attachments['tmp_name']));

      if(isset($upload['error']) && $upload['error'] != 0) {
          wp_die('There was an error uploading your file. The error is: ' . $upload['error']);
      } else {
        echo $upload['url'];
      }

    } else {
        wp_die('Formato de arquivo não suportado!');
    }

    die();
  }
  add_action('wp_ajax_fappUploadFile', 'fappUploadFile');
  add_action('wp_ajax_nopriv_fappUploadFile', 'fappUploadFile');

  function fappUploadImage() {

    $attachments = $_FILES['file'];

    // Setup the array of supported file types. In this case, it's just PDF.
    $supported_types = ['image/jpg', 'image/jpeg', 'image/png'];

    // Get the file type of the upload
    $arr_file_type = wp_check_filetype(basename($attachments['name']));
    $uploaded_type = $arr_file_type['type'];

    // Check if the type is supported. If not, throw an error.
    if(in_array($uploaded_type, $supported_types)) {

      // Use the WordPress API to upload the file
      $upload = wp_upload_bits($attachments['name'], null, file_get_contents($attachments['tmp_name']));

      if(isset($upload['error']) && $upload['error'] != 0) {
          wp_die('There was an error uploading your file. The error is: ' . $upload['error']);
      } else {
        echo $upload['url'];
      }

    } else {
        wp_die('Formato de arquivo não suportado!');
    }

    die();
  }
  add_action('wp_ajax_fappUploadImage', 'fappUploadImage');
  add_action('wp_ajax_nopriv_fappUploadImage', 'fappUploadImage');

?>
