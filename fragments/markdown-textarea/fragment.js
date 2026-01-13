import 'markdownEditorCX';

const textarea = document.getElementById(`${fragmentElementId}-textarea`);

function main() {
	if (layoutMode === 'edit' && textarea) {
		textarea.setAttribute('disabled', true);
		return;
	}

	import('@liferay/fragment-impl/api').then(
    	({ registerLocalizedInput, registerUnlocalizedInput }) => {
			const defaultLanguageId = themeDisplay.getDefaultLanguageId();

			if (input.localizable) {
				const { onChange } = registerLocalizedInput({
					defaultLanguageId,
					initialValues: input.valueI18n,
					inputElement: textarea,
					inputName: input.name,
					localizationInputsContainer: textarea.parentNode,
					namespace: fragmentElementId,
				});

				textarea.addEventListener('change', (event) => {
					onChange(event.target.value); // ✅ value, pas textContent
				});
			} else {
				registerUnlocalizedInput({
					defaultLanguageId,
					inputElement: textarea,
					readOnlyInputLabel: document.getElementById(
						`${fragmentElementId}-textarea-readonly`
					),
					unlocalizedFieldsState: input.attributes.unlocalizedFieldsState,
					unlocalizedMessageContainer: document.getElementById(
						`${fragmentElementId}-unlocalized-info`
					),
				});
			}

			const form = fragmentElement.closest('form');

			const classPK = form?.querySelector('input[name="classPK"]')?.value;
			const classNameId = form?.querySelector('input[name="classNameId"]')?.value;

			if (!classPK || !classNameId) {
				console.error('classPK ou classNameId manquant');
				return;
			}

			Liferay.Service(
				'/classname/fetch-by-class-name-id',
				{ classNameId: Number(classNameId) },
				function (cn) {
					const className = cn?.value;

					if (!className) {
						//console.error('Impossible de résoudre className depuis classNameId', classNameId);
						return;
					}

					const graphQLQuery = {
						query: "{objectAdmin_v1_0{objectDefinitions{items{className,restContextPath}}}}"
					};

					Liferay.Util.fetch('/o/graphql', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(graphQLQuery),
						credentials: 'include',
					})
					.then((r) => r.json())
					.then((json) => {
						if (json.errors) {
							console.error('GraphQL errors:', json.errors);
							return;
						}

						const items =
							json?.data?.objectAdmin_v1_0?.objectDefinitions?.items || [];

						const def = items.find((i) => i.className === className);

						if (!def?.restContextPath) {
							console.error(
								'restContextPath introuvable pour className',
								className,
								items
							);
							return;
						}

						fragmentElement.querySelector('markdown-editor').setAttribute("object-rest-context-path", def.restContextPath);
						fragmentElement.querySelector('markdown-editor').setAttribute("object-entry-id", classPK);

					})
					.catch((e) => console.error(e));
				}
			);
    	}
  	);
}

main();
