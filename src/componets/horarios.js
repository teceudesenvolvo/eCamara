import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function horarios() {
  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">Selecione o horário disponível para o seu atendimento.</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="9h" control={<Radio />} label="09:00h as 10:00h" />
        <FormControlLabel value="10h" control={<Radio />} label="10:00h as 11:00h" />
        <FormControlLabel value="11h" control={<Radio />} label="11:00h as 12:00h" />
        <FormControlLabel
          value="12h"
          disabled
          control={<Radio />}
          label="12:00h as 13:00h"
        />
      </RadioGroup>
    </FormControl>
  );
}