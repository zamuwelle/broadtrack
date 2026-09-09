import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useSetState } from '@shared/hooks/useSetState'
import { createEquipment } from '@/api/equipment/create-equipment'
import { updateEquipment } from '@/api/equipment/update-equipment'
import { uploadEquipmentImage as uploadImageApi } from '@/api/equipment/upload-equipment'
import { BasicFields } from '@/features/admin/inventory/components/BasicFields'
import { DetailFields } from '@/features/admin/inventory/components/DetailFields'
import { EquipmentFormActions } from '@/features/admin/inventory/components/EquipmentFormActions'
import { EquipmentImageBanner } from '@/features/admin/inventory/components/EquipmentImageBanner'

const defaultCategories = Object.freeze([])
const noop = () => null

const getInitialFormState = (equipment) => {
    const item = equipment || {}
    return {
        equipmentName: item.name || '',
        modelCode: item.model || '',
        serialNumber: item.serial_no || '',
        categoryId: (typeof item.category === 'string' ? item.category : item.category?.name) || '',
        shortDescription: item.description || '',
        technicalSpecs: item.specs || '',
        imageFile: null,
        previewUrl: item.image || '',
        isSubmitting: false,
        errorMessage: '',
        touched: Object.freeze({}),
        isCategoryOpen: false
    }
}

const createEquipmentPayload = (formValues, equipment, isEditMode) => {
    const item = equipment || {}
    return {
        name: formValues.equipmentName.trim(),
        brand: isEditMode && item.brand ? item.brand : formValues.equipmentName.trim(),
        model: formValues.modelCode.trim() || null,
        serial_no: formValues.serialNumber.trim() || (isEditMode ? item.serial_no : null) || null,
        category: formValues.categoryId,
        description: formValues.shortDescription.trim() || null,
        specs: formValues.technicalSpecs.trim() || null
    }
}

const uploadEquipmentImage = async (equipmentId, file) => {
    if (!file || !equipmentId) {
        return
    }
    await uploadImageApi({ id: equipmentId, file })
}

const useEquipmentFieldHandlers = (updateFormState) => {
    const handleNameChange = useCallback(
        (e) => {
            updateFormState((prev) => ({
                equipmentName: e.target.value,
                touched: { ...prev.touched, equipmentName: true }
            }))
        },
        [updateFormState]
    )

    const handleModelChange = useCallback(
        (e) => {
            updateFormState((prev) => ({
                modelCode: e.target.value,
                touched: { ...prev.touched, modelCode: true }
            }))
        },
        [updateFormState]
    )

    const handleSerialChange = useCallback(
        (e) => {
            updateFormState((prev) => ({
                serialNumber: e.target.value,
                touched: { ...prev.touched, serialNumber: true }
            }))
        },
        [updateFormState]
    )

    const handleCategoryChange = useCallback(
        (value) => {
            updateFormState((prev) => ({
                categoryId: value,
                touched: { ...prev.touched, categoryId: true }
            }))
        },
        [updateFormState]
    )

    const handleCategoryToggle = useCallback(() => {
        updateFormState((prev) => ({ isCategoryOpen: !prev.isCategoryOpen }))
    }, [updateFormState])

    const handleCategoryClose = useCallback(() => {
        updateFormState({ isCategoryOpen: false })
    }, [updateFormState])

    const handleDescChange = useCallback(
        (e) => {
            updateFormState((prev) => ({
                shortDescription: e.target.value,
                touched: { ...prev.touched, shortDescription: true }
            }))
        },
        [updateFormState]
    )

    const handleSpecsChange = useCallback(
        (e) => {
            updateFormState((prev) => ({
                technicalSpecs: e.target.value,
                touched: { ...prev.touched, technicalSpecs: true }
            }))
        },
        [updateFormState]
    )

    return {
        handleNameChange,
        handleModelChange,
        handleSerialChange,
        handleCategoryChange,
        handleCategoryToggle,
        handleCategoryClose,
        handleDescChange,
        handleSpecsChange
    }
}

const useEquipmentForm = (equipment, onClose, onSuccess) => {
    const fileInputReference = useRef(null)
    const savedEquipmentReference = useRef(equipment)
    const isMounted = useRef(false)
    const isSubmittingReference = useRef(false)
    const [formState, updateFormState] = useSetState(() => getInitialFormState(equipment))

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(
        () => () => {
            if (formState.imageFile) {
                globalThis.URL.revokeObjectURL(formState.previewUrl)
            }
        },
        [formState.imageFile, formState.previewUrl]
    )

    const fieldHandlers = useEquipmentFieldHandlers(updateFormState)

    const handleImageChange = useCallback(
        (event) => {
            const { files } = event.target
            const selectedFile = files ? files[0] : null
            if (selectedFile) {
                updateFormState({
                    imageFile: selectedFile,
                    previewUrl: globalThis.URL.createObjectURL(selectedFile)
                })
            }
        },
        [updateFormState]
    )

    const handleUploadClick = useCallback(() => {
        if (fileInputReference.current) {
            fileInputReference.current.click()
        }
    }, [])

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            if (
                isSubmittingReference.current ||
                !formState.equipmentName.trim() ||
                !formState.categoryId ||
                !formState.shortDescription.trim()
            ) {
                return
            }
            isSubmittingReference.current = true
            updateFormState({ isSubmitting: true, errorMessage: '' })
            const currentEquipment = savedEquipmentReference.current
            const isEditMode = Boolean(currentEquipment?.id)
            const payload = createEquipmentPayload(formState, currentEquipment, isEditMode)
            try {
                const { data: savedEquipment } = isEditMode
                    ? await updateEquipment({ id: currentEquipment.id, data: payload })
                    : await createEquipment(payload)

                savedEquipmentReference.current = savedEquipment || currentEquipment
                await uploadEquipmentImage(savedEquipmentReference.current?.id, formState.imageFile)
                if (isMounted.current) {
                    onSuccess()
                    onClose()
                }
            } catch (error) {
                if (isMounted.current) {
                    updateFormState({
                        errorMessage: (error && error.message) || 'Failed to save equipment asset'
                    })
                }
            } finally {
                isSubmittingReference.current = false
                if (isMounted.current) {
                    updateFormState({ isSubmitting: false })
                }
            }
        },
        [formState, onClose, onSuccess, updateFormState]
    )

    return {
        formState,
        fileInputReference,
        ...fieldHandlers,
        handleImageChange,
        handleUploadClick,
        handleSubmit
    }
}

export const EquipmentModalDialog = ({
    equipment = null,
    categories = defaultCategories,
    onClose = noop,
    onSuccess = noop
}) => {
    const isEditMode = Boolean(equipment)
    const {
        formState,
        fileInputReference,
        handleNameChange,
        handleModelChange,
        handleSerialChange,
        handleCategoryChange,
        handleCategoryToggle,
        handleCategoryClose,
        handleDescChange,
        handleSpecsChange,
        handleImageChange,
        handleUploadClick,
        handleSubmit
    } = useEquipmentForm(equipment, onClose, onSuccess)

    const {
        equipmentName,
        modelCode,
        serialNumber,
        categoryId,
        shortDescription,
        technicalSpecs,
        previewUrl,
        isSubmitting,
        errorMessage,
        touched,
        isCategoryOpen
    } = formState

    const nameError = touched.equipmentName && !equipmentName.trim() ? 'Equipment name is required' : ''
    const categoryError = touched.categoryId && !categoryId ? 'Please select a category' : ''
    const descriptionError = touched.shortDescription && !shortDescription.trim() ? 'Description is required' : ''
    const isFormValid = Boolean(equipmentName.trim() && categoryId && shortDescription.trim())

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Poppins']">
            <button
                type="button"
                aria-label="Close dialog"
                tabIndex={-1}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none"
                onClick={onClose}
            />
            <div className="bg-slate-50 rounded-2xl border border-slate-300 w-full max-w-[538px] max-h-[88dvh] overflow-y-scroll my-auto shadow-2xl flex flex-col relative z-10">
                <EquipmentImageBanner
                    previewUrl={previewUrl}
                    fileInputReference={fileInputReference}
                    onImageChange={handleImageChange}
                    onUploadClick={handleUploadClick}
                />

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 size-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer transition-colors">
                    <X className="size-4" />
                </button>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-3.5">
                    <BasicFields
                        equipmentName={equipmentName}
                        nameError={nameError}
                        modelCode={modelCode}
                        serialNumber={serialNumber}
                        onNameChange={handleNameChange}
                        onModelChange={handleModelChange}
                        onSerialChange={handleSerialChange}
                    />

                    <DetailFields
                        categoryId={categoryId}
                        categoryError={categoryError}
                        categories={categories}
                        isCategoryOpen={isCategoryOpen}
                        shortDescription={shortDescription}
                        descriptionError={descriptionError}
                        technicalSpecs={technicalSpecs}
                        onCategoryChange={handleCategoryChange}
                        onCategoryToggle={handleCategoryToggle}
                        onCategoryClose={handleCategoryClose}
                        onDescChange={handleDescChange}
                        onSpecsChange={handleSpecsChange}
                    />

                    {errorMessage ? (
                        <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                            {errorMessage}
                        </p>
                    ) : null}

                    <EquipmentFormActions
                        isFormValid={isFormValid}
                        isSubmitting={isSubmitting}
                        isEditMode={isEditMode}
                        onClose={onClose}
                    />
                </form>
            </div>
        </div>
    )
}
