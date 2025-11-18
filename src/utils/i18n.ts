import { translationEngine } from './translationEngine';

export function initializeI18n() {
    function updateTranslations() {
        // Mise à jour des textes standards (data-i18n)
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = translationEngine.get(key);
            }
        });

        // Mise à jour des attributs personnalisés dynamiques (data-i18n-*)
        // Sélectionner tous les éléments qui ont au moins un attribut commençant par data-i18n-
        const elements = Array.from(document.getElementsByTagName('*')).filter(el => 
            Array.from(el.attributes).some(attr => attr.name.startsWith('data-i18n-'))
        ) as HTMLElement[];
        
        elements.forEach(element => {
            // Parcourir tous les attributs de l'élément
            Array.from(element.attributes).forEach(attr => {
                // Vérifier si l'attribut commence par data-i18n-
                if (attr.name.startsWith('data-i18n-') && attr.name !== 'data-i18n') {
                    const attributeName = attr.name.replace('data-i18n-', '');
                    const translationKey = attr.value;
                    
                    // Mettre à jour l'attribut correspondant avec la traduction
                    if (translationKey) {
                        const translation = translationEngine.get(translationKey);
                        element.setAttribute(attributeName, translation);
                    }
                }
            });
        });
    }

    window.addEventListener('languageChanged', updateTranslations);
    updateTranslations();
}