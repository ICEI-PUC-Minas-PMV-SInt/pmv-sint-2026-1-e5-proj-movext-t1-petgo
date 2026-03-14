import React from "react";
import { UseFormRegister, FieldValues, FieldErrors, Path } from "react-hook-form";

interface FormFieldProps<TFieldValues extends FieldValues> {
  label: string;
  name: keyof TFieldValues;
  type?: string;
  register: UseFormRegister<TFieldValues>; 
  errors: FieldErrors<TFieldValues>;
  className?: string;
  placeholder: string;
}

export const FormField = <TFieldValues extends FieldValues>({
  label,
  name,
  type = "text",
  register,
  errors,
  className = "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900",
  placeholder
}: FormFieldProps<TFieldValues>) => {
  const errorMessage = errors[name]?.message as string;
  const nameString = name as string;

  return (
    <div>
      <label htmlFor={nameString} className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <input
        id={nameString}
        type={type}
        {...register(name as Path<TFieldValues>)}
        className={`${className} ${
          errorMessage ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
        }`}
        placeholder={placeholder}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};