# PDF Attachments for WordPress Posts & Pages
This plugin will add a custom metabox controller to attach PDF files to WordPress posts

The custom metabox name is <code>wppa_attachment_list</code>. It's saved as a JSON *string* list

**Just download the source and install it as a plugin.**

### AJAX path
If the plugin doesn't work, try to specify the full wordpress ajax path in <code>main.js</code>:

```javascript
request.open("POST", '//' + window.location.host + '/wp-admin/admin-ajax.php', true);
```
