import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Tooltip,
    Switch,
    FormControlLabel,
    Grid,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { Template } from '../../types/template';
import { Script } from '../../types/script';
import {
    getTemplates,
    saveTemplate,
    deleteTemplate,
    scriptToTemplate,
    templateToScript,
    exportTemplateToFile,
    importTemplateFromFile,
} from '../../services/templateService';

interface TemplateManagerProps {
    currentScript?: Script;
    onTemplateSelect?: (script: Script) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
    currentScript,
    onTemplateSelect,
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateDescription, setNewTemplateDescription] = useState('');
    const [preserveContent, setPreserveContent] = useState(false);
    const [preserveBackground, setPreserveBackground] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = () => {
        try {
            const loadedTemplates = getTemplates();
            // Ensure each template has a components array
            const validTemplates = loadedTemplates.map(template => ({
                ...template,
                components: template.components || []
            }));
            setTemplates(validTemplates);
        } catch (error) {
            console.error('Failed to load templates:', error);
            setTemplates([]);
        }
    };

    const handleSaveTemplate = () => {
        if (!currentScript || !newTemplateName.trim()) return;

        const template = scriptToTemplate(
            currentScript,
            newTemplateName.trim(),
            newTemplateDescription.trim() || undefined,
            {
                preserveContent,
                preserveBackground,
            }
        );

        saveTemplate(template);
        loadTemplates();
        setIsAddDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewTemplateName('');
        setNewTemplateDescription('');
        setPreserveContent(false);
        setPreserveBackground(false);
    };

    const handleDeleteTemplate = (templateId: string) => {
        deleteTemplate(templateId);
        loadTemplates();
    };

    const handleTemplateSelect = (template: Template) => {
        if (onTemplateSelect) {
            const script = templateToScript(template);
            onTemplateSelect(script);
        }
    };

    const handleExportTemplate = async (template: Template) => {
        try {
            const templateFile = await exportTemplateToFile(template);
            const blob = new Blob([JSON.stringify(templateFile, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export template:', error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const templateFile = JSON.parse(content);
                    const template = await importTemplateFromFile(templateFile);
                    // Ensure template has components array
                    const validTemplate = {
                        ...template,
                        components: template.components || []
                    };
                    saveTemplate(validTemplate);
                    loadTemplates();
                } catch (error) {
                    console.error('Failed to process template file:', error);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Failed to import template:', error);
        }
        
        event.target.value = '';
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Templates</Typography>
                <Box>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleFileImport}
                    />
                    <Button
                        startIcon={<UploadIcon />}
                        onClick={handleImportClick}
                        sx={{ mr: 1 }}
                    >
                        Import
                    </Button>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddDialogOpen(true)}
                        disabled={!currentScript}
                    >
                        Save as Template
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {templates.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {template.name || 'Untitled Template'}
                                </Typography>
                                {template.description && (
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {template.description}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                    {(template.components || []).length} components
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button 
                                    size="small" 
                                    onClick={() => handleTemplateSelect(template)}
                                    disabled={!template.components?.length}
                                >
                                    Use Template
                                </Button>
                                <IconButton
                                    size="small"
                                    onClick={() => handleExportTemplate(template)}
                                >
                                    <DownloadIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {templates.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="textSecondary" align="center" py={2}>
                            No templates saved yet
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
                <DialogTitle>Save as Template</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Template Name"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description (optional)"
                            value={newTemplateDescription}
                            onChange={(e) => setNewTemplateDescription(e.target.value)}
                            margin="normal"
                            multiline
                            rows={2}
                        />
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preserveContent}
                                        onChange={(e) => setPreserveContent(e.target.checked)}
                                    />
                                }
                                label="Preserve content (text, images)"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={preserveBackground}
                                        onChange={(e) => setPreserveBackground(e.target.checked)}
                                    />
                                }
                                label="Preserve background"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSaveTemplate}
                        disabled={!newTemplateName.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 