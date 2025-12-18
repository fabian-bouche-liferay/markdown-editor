import 'markdownEditorCX';
const errorMessage = document.getElementById(
	`${fragmentElementId}-textarea-error-message`
);
const formGroup = document.getElementById(`${fragmentElementId}-form-group`);
const textarea = document.getElementById(`${fragmentElementId}-textarea`);

function main() {
	if (layoutMode === 'edit' && textarea) {
		textarea.setAttribute('disabled', true);
	}
	else {
		import('@liferay/fragment-impl/api').then(
			({
				registerLocalizedInput,
				registerUnlocalizedInput,
			}) => {

				const defaultLanguageId = themeDisplay.getDefaultLanguageId();

				if (input.localizable) {
					const {onChange} = registerLocalizedInput({
						defaultLanguageId,
						initialValues: input.valueI18n,
						inputElement: textarea,
						inputName: input.name,
						localizationInputsContainer: textarea.parentNode,
						namespace: fragmentElementId,
					});

					textarea.addEventListener('change', (event) => {
						onChange(event.target.textContent);
					});
				}
				else {
					registerUnlocalizedInput({
						defaultLanguageId,
						inputElement: textarea,
						readOnlyInputLabel: document.getElementById(
							`${fragmentElementId}-textarea-readonly`
						),
						unlocalizedFieldsState:
							input.attributes.unlocalizedFieldsState,
						unlocalizedMessageContainer: document.getElementById(
							`${fragmentElementId}-unlocalized-info`
						),
					});
				}
			}
		);
	}
}

main();