import { Template, TemplateComponent, TemplateFile } from '../types/template';
import { Script, BaseScriptComponent } from '../types/script';

const CURRENT_VERSION = '1.0.0';
const TEMPLATES_STORAGE_KEY = 'saved_templates';

// Convert a script to a template
export const scriptToTemplate = (
    script: Script, 
    name: string, 
    description?: string,
    options: {
        preserveContent?: boolean;
        preserveBackground?: boolean;
    } = {}
): Template => {
    const templateComponents: TemplateComponent[] = script.components.map(component => {
        // Remove content-specific data but keep structure and styling
        const templateComponent = { ...component } as TemplateComponent;
        
        if (!options.preserveContent) {
            if ('text' in templateComponent) {
                const text = (templateComponent as any).text;
                delete (templateComponent as any).text;
                templateComponent.placeholderText = text;
                templateComponent.keepContent = false;
            }
            
            if ('audioUrl' in templateComponent) {
                delete (templateComponent as any).audioUrl;
            }
            
            if ('wordTimings' in templateComponent) {
                delete (templateComponent as any).wordTimings;
            }

            if ('imageUrl' in templateComponent) {
                const imageUrl = (templateComponent as any).imageUrl;
                delete (templateComponent as any).imageUrl;
                templateComponent.placeholderText = imageUrl;
                templateComponent.keepContent = false;
            }
        } else {
            templateComponent.keepContent = true;
        }
        
        return templateComponent;
    });

    // Handle background based on preserveBackground option
    const settings = { ...script.settings };
    if (!options.preserveBackground) {
        if (settings.background?.url?.startsWith('blob:')) {
            settings.background = {
                ...settings.background,
                url: undefined
            };
        }
    }
    settings.preserveBackground = options.preserveBackground;

    return {
        id: `template_${Date.now()}`,
        name,
        description,
        components: templateComponents,
        settings,
        version: CURRENT_VERSION
    };
};

// Convert a template to a script
export const templateToScript = (template: Template): Script => {
    const scriptComponents: BaseScriptComponent[] = template.components.map(component => {
        const scriptComponent = { ...component } as BaseScriptComponent;
        
        if (component.keepContent) {
            // Keep the original content
            return scriptComponent;
        }

        if (component.placeholderText) {
            if (component.type === 'text') {
                (scriptComponent as any).text = component.placeholderText;
            } else if (component.type === 'image') {
                (scriptComponent as any).imageUrl = component.placeholderText;
            }
        }
        
        return scriptComponent;
    });

    return {
        id: `script_${Date.now()}`,
        name: template.name,
        components: scriptComponents,
        settings: template.settings
    };
};

// Save template to local storage
export const saveTemplate = (template: Template): void => {
    const templates = getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
        templates[existingIndex] = template;
    } else {
        templates.push(template);
    }
    
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

// Get all templates from local storage
export const getTemplates = (): Template[] => {
    const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return templatesJson ? JSON.parse(templatesJson) : [];
};

// Get template by ID
export const getTemplateById = (id: string): Template | undefined => {
    const templates = getTemplates();
    return templates.find(t => t.id === id);
};

// Delete template
export const deleteTemplate = (id: string): void => {
    const templates = getTemplates().filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

// Export template to file
export const exportTemplateToFile = async (template: Template): Promise<TemplateFile> => {
    const templateFile: TemplateFile = {
        template: { ...template },
        assets: {
            images: {},
            audio: {}
        }
    };

    // Convert image URLs to base64
    for (const component of template.components) {
        if ('imageUrl' in component && component.imageUrl) {
            try {
                const response = await fetch(component.imageUrl);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                templateFile.assets!.images![component.imageUrl] = base64;
            } catch (error) {
                console.error('Failed to convert image to base64:', error);
            }
        }
    }

    return templateFile;
};

// Import template from file
export const importTemplateFromFile = async (templateFile: TemplateFile): Promise<Template> => {
    const template = { ...templateFile.template };
    
    // Convert base64 images back to blob URLs
    if (templateFile.assets?.images) {
        for (const component of template.components) {
            if ('imageUrl' in component && component.imageUrl) {
                const base64 = templateFile.assets.images[component.imageUrl];
                if (base64) {
                    try {
                        const response = await fetch(base64);
                        const blob = await response.blob();
                        (component as any).imageUrl = URL.createObjectURL(blob);
                    } catch (error) {
                        console.error('Failed to convert base64 to blob URL:', error);
                    }
                }
            }
        }
    }
    
    return template;
}; 