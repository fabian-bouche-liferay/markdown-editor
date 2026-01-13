[#assign infoListDisplayObject = (request.getAttribute("INFO_ITEM"))! /]

<span class="d-none" data-lfr-editable-id="01 - Markdown" data-lfr-editable-type="text"></span>
<markdown-renderer
	[#if infoListDisplayObject.objectEntryId?? && infoListDisplayObject.objectDefinitionId??]
		object-definition-id=${infoListDisplayObject.objectDefinitionId}
		object-entry-id=${infoListDisplayObject.objectEntryId}
	[/#if]
></markdown-renderer>