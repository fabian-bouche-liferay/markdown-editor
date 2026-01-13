# How to

Deploy the client extension `blade gw clean deploy`

Create the two fragments described in the fragment directory.

 - One is the markdown editor, a form fragment
 - The other one is a regular fragment, to render Markdown

Works against Liferay objects where markdown is written to a Long Text field.

## Custom url schemes for pictures

### Picture from an object field

```
![image alt](liferay://object-field/objectFieldName)
```

Where `objectFieldName` is the name of the object field which contains a picture (attachment type).

### Picture from the document library

```
![image alt](liferay://document-library/externalReferenceCode)
```

Where `externalReferenceCode` is the ERC of the document from the site's document library.

It's limited to documents from the current site for the moment.

## Required permissions

For each object field with an image, the viewer must have the associated Download permission.

And in addition to that, we have to give `Guest` the `View` permission against the object definition.

The reason is there is a required call to dynamically get the `restContextPath` of the Object Definition so as to call the Object's REST API.
