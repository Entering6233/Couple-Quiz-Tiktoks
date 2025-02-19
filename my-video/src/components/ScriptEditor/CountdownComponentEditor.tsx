import React from 'react';
import { CountdownComponent } from '../../types/script';
import { TextField, Grid, Switch, FormControlLabel } from '@mui/material';

interface CountdownComponentEditorProps {
    component: CountdownComponent;
    onChange: (component: CountdownComponent) => void;
}

export const CountdownComponentEditor: React.FC<CountdownComponentEditorProps> = ({ component, onChange }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    type="number"
                    label="Count From"
                    value={component.from}
                    onChange={(e) => onChange({
                        ...component,
                        from: parseInt(e.target.value) || 0
                    })}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={component.sound ?? false}
                            onChange={(e) => onChange({
                                ...component,
                                sound: e.target.checked
                            })}
                        />
                    }
                    label="Play Sound"
                />
            </Grid>
        </Grid>
    );
}; 