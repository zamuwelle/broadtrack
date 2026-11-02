const checkeredBackgroundStyle = Object.freeze({
    backgroundImage: 'repeating-conic-gradient(#a8a8a8 0% 25%, #cfcfcf 0% 50%)',
    backgroundSize: '16px 16px'
})
const noop = () => null

export const EquipmentImageBanner = ({
    previewUrl = '',
    fileInputReference = null,
    onImageChange = noop,
    onUploadClick = noop
}) => (
    <button
        type="button"
        onClick={onUploadClick}
        style={checkeredBackgroundStyle}
        className="h-36 sm:h-52 relative flex items-center justify-center overflow-hidden border-b border-slate-200 group shrink-0 cursor-pointer select-none w-full">
        {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
        ) : (
            <div className="text-center p-4">
                <p className="text-xs font-medium text-slate-700">Click to upload equipment image</p>
                <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
            </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                {previewUrl ? 'Change Image' : 'Upload Image'}
            </span>
        </div>
        <input ref={fileInputReference} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
    </button>
)
