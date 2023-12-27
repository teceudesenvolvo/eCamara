import * as React from 'react';
import dayjs from 'dayjs';
import ptBR from 'dayjs/locale/pt-br';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

export default function CustomizeDayPicker() {
  const [value, setValue] = React.useState(dayjs());
  console.log(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}
      adapterLocale={ptBR}

    >
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={value}
        disablePast
        onChange={(newValue) => {
          setValue(newValue);
          console.log(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
        dayOfWeekFormatter={(day) => `${day}.`}
        toolbarFormat="ddd DD MMMM"

      />
    </LocalizationProvider>
  );
}