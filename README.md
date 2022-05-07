# File Attachments for Posts & Pages
Custom metabox controller to upload and manage posts / pages attachments

The custom metabox name is <code>fapp_attachment_list</code>. It's saved as a JSON *object* list:

```json
{
  "name": "Attachment Name",
  "description": "Attachment Description",
  "cover_image": "http://xyz/nice_image.jpg",
  "url": "http://xyz/nice_doc.pdf"
}
```

### Supported file types
```php
[
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/vnd.oasis.opendocument.text',
  'application/msword'
]
```

**Just download the source and install it as a plugin.**
