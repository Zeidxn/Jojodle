import { useState, useMemo } from "react";
import { TextField, Autocomplete, Avatar, Box, Typography } from "@mui/material";

export default function CharacterAutocomplete({ characters, onSelect }) {
    const [inputValue, setInputValue] = useState("");

    const filteredOptions = useMemo(() => {
        const value = inputValue.toLowerCase();
        return characters.filter((c) => {
            const [firstName, lastName, thirdName] = c.name.toLowerCase().split(" ");
            return (
                firstName.startsWith(value) ||
                (lastName && lastName.startsWith(value)) ||
                (thirdName && thirdName.startsWith(value))
            );
        });
    }, [characters, inputValue]);


    return (
        <Autocomplete
            options={filteredOptions}
            getOptionLabel={(option) => option.name}
            value={null}
            inputValue={inputValue}
            onInputChange={(event, newInput) => setInputValue(newInput)}
            onChange={(event, newValue) => {
                if (newValue) {
                    onSelect(newValue);
                    setInputValue("");
                }
            }}
            open={inputValue.length > 0 && filteredOptions.length > 0}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                    <Box
                        component="li"
                        key={key}
                        {...otherProps}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <Avatar
                            src={option.image}
                            alt={option.name}
                            sx={{ width: 32, height: 32 }}
                        />
                        <Typography>{option.name}</Typography>
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Entrer un personnage..."
                    variant="outlined"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (filteredOptions.length > 0) {
                                onSelect(filteredOptions[0]);
                                setInputValue("");
                            }
                        }
                    }}
                />
            )}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.9)",
                        color: "#fff",
                        border: "1px solid #e137b0",
                        borderRadius: "12px",
                    },
                },
            }}
            sx={{
                width: 300,
                marginBottom: "1rem",
                "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    "& fieldset": { borderColor: "#e137b0" },
                    "&:hover fieldset": { borderColor: "#710852" },
                    "&.Mui-focused fieldset": { borderColor: "#710852", borderWidth: 2 },
                },
                "& .MuiInputLabel-root": { color: "#e137b0" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#710852" },
                "& .MuiAutocomplete-listbox": {
                    backgroundColor: "rgba(0,0,0,0.9)", // menu déroulant sombre
                    color: "#fff",
                    maxHeight: "200px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                },
                "& .MuiAutocomplete-option": {
                    backgroundColor: "rgba(0,0,0,0.9)",
                    "&[aria-selected='true']": { backgroundColor: "#e137b0", color: "#fff" },
                    "&.Mui-focused": { backgroundColor: "#710852", color: "#fff" },
                },
            }}
        />

    );
}
