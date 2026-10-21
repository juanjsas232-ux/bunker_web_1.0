import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { parseAndValidateCSV, CSVValidationResult, downloadSampleCSVTemplate } from '../../lib/csv';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X, Loader2 } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { products, saveProduct } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsValidating(true);
    setValidationResult(null);
    setSuccessCount(null);

    try {
      const res = await parseAndValidateCSV(selectedFile, products);
      setValidationResult(res);
    } catch (err: any) {
      alert(`Error leyendo archivo CSV: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsApplying(true);
    let count = 0;

    try {
      for (const row of validationResult.validRows) {
        await saveProduct(row);
        count++;
      }
      setSuccessCount(count);
      setValidationResult(null);
      setFile(null);
    } catch (err: any) {
      alert(`Error aplicando productos: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ECEEF1]">
        {/* Header */}
        <div className="bg-[#17191D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#282C33]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28]">
              Gestión Masiva
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Importar Catálogo por CSV
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#282C33]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Download Template Strip */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECEEF1] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-[#17191D]">¿No tenés la estructura correcta?</p>
              <p className="text-gray-500 text-[11px]">
                Descargá nuestra plantilla de ejemplo con las columnas preconfiguradas.
              </p>
            </div>
            <button
              onClick={downloadSampleCSVTemplate}
              className="px-3.5 py-2 bg-white border border-[#E2E4E9] rounded-xl font-bold text-gray-700 hover:text-[#F28C28] flex items-center gap-1.5 shadow-sm transition"
            >
              <Download size={14} />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#ECEEF1] rounded-2xl p-8 text-center hover:border-[#F28C28] transition bg-[#FAFAF8]">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              id="csvFileInput"
              className="hidden"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 text-[#F28C28] flex items-center justify-center mx-auto">
                <Upload size={22} />
              </div>
              <p className="font-bold text-sm text-[#17191D]">
                {file ? file.name : 'Hacé clic para seleccionar tu archivo CSV'}
              </p>
              <p className="text-[11px] text-gray-400">
                Formato UTF-8 delimitado por comas
              </p>
            </label>
          </div>

          {isValidating && (
            <div className="text-center py-4 flex items-center justify-center gap-2 text-gray-500 font-bold">
              <Loader2 size={16} className="animate-spin" />
              <span>Validando columnas, SKU y formatos...</span>
            </div>
          )}

          {/* Success Message */}
          {successCount !== null && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800">
              <CheckCircle2 size={24} className="text-[#25D366] flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">¡Importación completada con éxito!</p>
                <p className="text-xs">Se actualizaron o crearon {successCount} productos en el catálogo.</p>
              </div>
            </div>
          )}

          {/* Validation Report */}
          {validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <p className="text-xl font-black text-blue-700">{validationResult.newCount}</p>
                  <p className="text-[11px] font-bold text-blue-600">Nuevos a crear</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <p className="text-xl font-black text-yellow-700">{validationResult.updateCount}</p>
                  <p className="text-[11px] font-bold text-yellow-600">A actualizar por SKU</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-xl font-black text-red-700">{validationResult.errors.length}</p>
                  <p className="text-[11px] font-bold text-red-600">Filas con errores</p>
                </div>
              </div>

              {/* Errors Breakdown (if any) */}
              {validationResult.errors.length > 0 && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                  <p className="font-bold text-red-800 flex items-center gap-1.5">
                    <AlertCircle size={15} />
                    Observaciones encontradas en el archivo:
                  </p>
                  <ul className="space-y-1 text-red-700 max-h-32 overflow-y-auto">
                    {validationResult.errors.map((err, idx) => (
                      <li key={idx} className="flex justify-between border-b border-red-100 pb-1">
                        <span>Fila {err.row} (SKU: {err.sku}):</span>
                        <strong className="text-red-900">{err.error}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={handleApplyChanges}
                  disabled={isApplying || validationResult.validRows.length === 0}
                  className="w-full py-3.5 bg-[#F28C28] hover:bg-[#d9771e] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Procesando e impactando en base de datos...</span>
                    </>
                  ) : (
                    <span>Confirmar e Importar {validationResult.validRows.length} Productos</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
