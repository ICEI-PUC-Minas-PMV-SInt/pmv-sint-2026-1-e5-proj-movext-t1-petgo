import React from "react";
import { Control, FieldValues, Path, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { formatPhone } from "@/lib/utils"; 

interface PhoneFieldProps<TFieldValues extends FieldValues> {
  label: string;
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  errors?: FieldErrors<TFieldValues>; 
}

export const PhoneField = <TFieldValues extends FieldValues>({
  label,
  name,
  control,
  errors,
}: PhoneFieldProps<TFieldValues>) => {
  const errorMessage = errors?.[name]?.message as string;
  const nameString = name as string;
  const baseClassName = "w-full px-3 py-2 border rounded-lg text-gray-900";
  
  return (
    <div>
      <label htmlFor={nameString} className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            id={nameString}
            type="tel" 
            placeholder="(99) 99999-9999"
            onChange={(e) => {
              const formattedValue = formatPhone(e.target.value);
              field.onChange(formattedValue);
            }}
            className={`${baseClassName} ${
              errorMessage 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
        )}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};