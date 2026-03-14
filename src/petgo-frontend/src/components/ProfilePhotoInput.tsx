"use client";
import React, { useState } from "react";
import { UseFormSetValue, FieldValues, Path } from "react-hook-form";
import { Trash2, Upload } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface ProfilePhotoInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  currentUrl: string | null | undefined;
  setValue: UseFormSetValue<TFieldValues>;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.85
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error("Falha ao comprimir a imagem no canvas."));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export const ProfilePhotoInput = <TFieldValues extends FieldValues>({
    name,
    currentUrl,
    setValue,
}: ProfilePhotoInputProps<TFieldValues>) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        currentUrl || null
    );
    const nameString = name as string;

const handleImageRemove = () => {
        setPreviewUrl(null);
        setValue(name, null as TFieldValues[Path<TFieldValues>], {
            shouldValidate: true,
        });
        const input = document.getElementById(nameString) as HTMLInputElement;
        if (input) input.value = "";
        if (currentUrl && currentUrl.startsWith("blob:")) {
            URL.revokeObjectURL(currentUrl);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            handleImageRemove();
            return;
        }

        setUploading(true);

        const tempLocalUrl = URL.createObjectURL(file);
        setPreviewUrl(tempLocalUrl);

        try {
            if (file.size > 5 * 1024 * 1024) { 
                throw new Error("A imagem é muito grande. Máximo 5MB."); 
            }

            const compressedFile = await compressImage(file);
            
            await new Promise(resolve => setTimeout(resolve, 500)); 

            const finalBase64Url = await fileToBase64(compressedFile); 


            setValue(name, finalBase64Url as TFieldValues[Path<TFieldValues>], {
                shouldValidate: true,
            });
            setPreviewUrl(finalBase64Url);

        } catch (error) {
            const errorMessage = 
                error instanceof Error 
                ? error.message 
                : "Erro desconhecido no processamento.";
                
            console.error("Falha no upload da foto de perfil:", error);
            alert(`Erro ao enviar a foto. Detalhes: ${errorMessage}`);
            handleImageRemove(); 
        } finally {
            setUploading(false);
        }
    };

  return (
    <div className="space-y-4">
      {/* Se não houver URL e não estiver carregando, mostra a visualização inicial simples */}
      {!previewUrl && !uploading ? (
        <div className="flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={nameString}
            disabled={uploading}
          />
          <label
            htmlFor={nameString}
            className="flex flex-col items-center justify-center w-28 h-28 
                               border-2 border-dashed border-gray-300 rounded-full cursor-pointer 
                               hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload size={24} className="text-gray-500" />
            <span className="text-xs text-gray-600 mt-1">Adicionar Foto</span>
          </label>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-28 h-28 flex-shrink-0 relative">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-indigo-400 relative group shadow-lg">
              {previewUrl ? (
                <SafeImage
                  src={previewUrl}
                  alt="Foto de Perfil"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                  Sem Foto
                </div>
              )}

              {previewUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageRemove();
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  title="Remover foto"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={nameString}
              disabled={uploading}
            />
            <label
              htmlFor={nameString}
              className={`
                            flex flex-col items-center justify-center
                            w-full h-24 border-2 border-dashed border-gray-300 rounded-lg 
                            cursor-pointer transition-all duration-200
                            ${
                              uploading
                                ? "opacity-50 cursor-not-allowed bg-gray-50"
                                : "hover:border-blue-400 hover:bg-blue-50"
                            }
                        `}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <LoadingSpinner />
                  <span className="text-sm text-gray-600 font-medium">
                    Enviando foto...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload size={24} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Clique para substituir (JPG, PNG)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
