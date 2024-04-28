import { ButtonHider } from "./features/ButtonHider";
import { UserService } from "./services/UserService";

console.log("ContentScript -> started ");

// Главная функция, которая наблюдает за изменениями в DOM
const observeDOMChanges = () => {
    const observer = new MutationObserver((mutations) => {
        // Перебор всех мутаций
        mutations.forEach((mutation) => {
            // Перебор всех добавленных узлов
            mutation.addedNodes.forEach(async (node) => {
                // Если узел - элемент
                if (node.nodeType === Node.ELEMENT_NODE) {
                    ButtonHider.checkNode(node);
                    await UserService.checkNode(node);
                }
            });
        });
    });

    // Конфигурация observer для начала наблюдения
    const config = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
    };

    // Начать наблюдение за body и его изменениями
    observer.observe(document.body, config);
};

observeDOMChanges();
