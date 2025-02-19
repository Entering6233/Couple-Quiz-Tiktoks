import React from 'react';
import { TitleComponent } from '../../types/script';
import { TextField, Grid } from '@mui/material';

interface TitleComponentEditorProps {
    component: TitleComponent;
    onChange: (component: TitleComponent) => void;
}

export const TitleComponentEditor: React.FC<TitleComponentEditorProps> = ({ component, onChange }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Title Text"
                    value={component.text}
                    onChange={(e) => onChange({
                        ...component,
                        text: e.target.value
                    })}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Subtitle"
                    value={component.subtitle || ''}
                    onChange={(e) => onChange({
                        ...component,
                        subtitle: e.target.value
                    })}
                />
            </Grid>
        </Grid>
    );
}; 