<?php

  /*
    This file is part of Icons Picker for FontAwesome.
    Icons Picker for FontAwesome is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    Icons Picker for FontAwesome is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with Icons Picker for FontAwesome.  If not, see <https://www.gnu.org/licenses/>
  */

  /*
  * Plugin Name: PDF Files for WordPress Posts
  * Plugin URI: https://github.com/Valkyria-tech/wordpress-post-pdf-files
  * Description:
  * Version: 0.0.1
  * Author: Victor Andeloci - ValkyriaTech
  * Author URI: https://github.com/victorandeloci
  * License: GPLv3
  * License URI: https://www.gnu.org/licenses/gpl-3.0.pt-br.html
  */

  function wppd_pdf_files_block(){
    $html = '
      <div id="pdfFilesContainer"></div>
      <input type="file" id="wppd_pdf_file" name="wppd_pdf_file" value="" size="25"/>
      <input type="hidden" id="wppd_pdf_file_list" name="wppd_pdf_file_list" value=""/>
    ';

    echo $html;
  }

  function loadPdfFilesBox() {

    wp_enqueue_script(
      'main',
      plugin_dir_url(__FILE__) . 'js/main.js',
      null,
      true
    );

    wp_enqueue_style(
      'fontawesome-css',
      plugin_dir_url(__FILE__) . 'css/all.min.css',
      null,
      '5.15.1',
      'screen'
    );

    wp_enqueue_style(
      'style',
      plugin_dir_url(__FILE__) . 'css/style.css',
      null,
      '1.0.0',
      'screen'
    );

    //custom metabox
    add_meta_box(
        'wppd_pdf_files_block',
        'Arquivos PDF',
        'wppd_pdf_files_block',
        'post',
        'side'
    );

  }
  add_action('add_meta_boxes', 'loadPdfFilesBox');

  function wppd_metabox_save( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( $parent_id = wp_is_post_revision( $post_id ) ) {
        $post_id = $parent_id;
    }
    $fields = [
        'wppd_pdf_file_list'
    ];
    foreach ( $fields as $field ) {
        if ( array_key_exists( $field, $_POST ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( $_POST[$field] ) );
        }
     }
  }
  add_action( 'save_post', 'wppd_metabox_save' );

  function wppdUploadFile() {

    $attachments = $_FILES['file'];

    // Setup the array of supported file types. In this case, it's just PDF.
    $supported_types = array('application/pdf');

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
  add_action('wp_ajax_wppdUploadFile', 'wppdUploadFile');
  add_action('wp_ajax_nopriv_wppdUploadFile', 'wppdUploadFile');
