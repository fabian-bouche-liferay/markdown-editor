const resolveDLByERC = async (groupId, externalReferenceCode) => { 

    return window.Liferay.Util.fetch(`/o/headless-delivery/v1.0/sites/${groupId}/documents/by-external-reference-code/${externalReferenceCode}?fields=contentUrl`)
        .then(data => {return data.json()})
        .then(json => {return json.contentUrl});

};

export default resolveDLByERC;