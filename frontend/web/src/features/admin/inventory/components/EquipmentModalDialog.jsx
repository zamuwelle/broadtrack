import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useSetState } from '@shared/hooks/useSetState'
import { equipmentSchema } from '@shared/schemas/equipment'
import { useCreateEquipment } from '@/features/equipment/api/create-equipment'
import { useUpdateEquipment } from '@/features/equipment/api/update-equipment'
import { useUploadEquipmentImage } from '@/features/equipment/api/upload-equipment'
import { BasicFields } from '@/features/admin/inventory/components/BasicFields'
import { DetailFields } from '@/features/admin/inventory/components/DetailFields'
import { EquipmentFormActions } from '@/features/admin/inventory/components/EquipmentFormActions'
import { EquipmentImageBanner } from '@/features/admin/inventory/components/EquipmentImageBanner'

const defaultCategories = Object.freeze([])
const noop = () => null
const ALL_TOUCHED = Object.freeze({
    equipmentName: true,
    categoryId: true,
    shortDescription: true,
    modelCode: true,
    serialNumber: true,
    technicalSpecs: true
})

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
        serverErrors: Object.freeze({}),
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

const parseClientErrors = (formValues) => {
    const result = equipmentSchema.safeParse(formValues)
    if (result.success) {
        return {}
    }
    const errors = {}
    for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field && !errors[field]) {
            errors[field] = issue.message
        }
    }
    return errors
}

const extractServerErrors = (error) => {
    const errors = (error && error.errors) || {}
    return {
        name: Array.isArray(errors.name) ? errors.name[0] : '',
        category: Array.isArray(errors.category) ? errors.category[0] : '',
        description: Array.isArray(errors.description) ? errors.description[0] : '',
        serial_no: Array.isArray(errors.serial_no) ? errors.serial_no[0] : ''
    }
}

const resolveFieldError = (isTouched, clientError, serverError) => {
    if (isTouched && clientError) {
        return clientError
    }
    return serverError || ''
}

const resolveActiveError = (errorMessage, touched, clientErrors) => {
    if (errorMessage) {
        return errorMessage
    }
    if (touched.serialNumber && clientErrors.serialNumber) {
        return clientErrors.serialNumber
    }
    if (touched.modelCode && clientErrors.modelCode) {
        return clientErrors.modelCode
    }
    return ''
}

const executeSave = async ({ isEditMode, currentEquipment, payload, createMutation, updateMutation }) => {
    const response = isEditMode
        ? await updateMutation.mutateAsync({ id: currentEquipment.id, data: payload })
        : await createMutation.mutateAsync(payload)
    if (response?.data?.id) {
        return response.data
    }
    if (response?.id) {
        return response
    }
    return response?.data || currentEquipment
}

const tryUploadImage = async ({ uploadMutation, equipmentId, file, onSuccess, isMounted, updateFormState }) => {
    if (!file) {
        return true
    }
    try {
        await uploadMutation.mutateAsync({ id: equipmentId, file })
        return true
    } catch (uploadError) {
        onSuccess()
        if (isMounted.current) {
            updateFormState({
                errorMessage:
                    (uploadError && uploadError.message) ||
                    'Equipment saved, but image upload failed. Retry to upload the image.'
            })
        }
        return false
    }
}

const useEquipmentFieldHandlers = (updateFormState) => {
    const updateField = useCallback(
        (field, value, serverField) => {
            updateFormState((prev) => ({
                [field]: value,
                touched: { ...prev.touched, [field]: true },
                serverErrors: serverField ? { ...prev.serverErrors, [serverField]: '' } : prev.serverErrors,
                errorMessage: ''
            }))
        },
        [updateFormState]
    )

    return {
        handleNameChange: useCallback((e) => updateField('equipmentName', e.target.value, 'name'), [updateField]),
        handleModelChange: useCallback((e) => updateField('modelCode', e.target.value), [updateField]),
        handleSerialChange: useCallback((e) => updateField('serialNumber', e.target.value, 'serial_no'), [updateField]),
        handleCategoryChange: useCallback((val) => updateField('categoryId', val, 'category'), [updateField]),
        handleCategoryToggle: useCallback(
            () => updateFormState((prev) => ({ isCategoryOpen: !prev.isCategoryOpen })),
            [updateFormState]
        ),
        handleCategoryClose: useCallback(() => updateFormState({ isCategoryOpen: false }), [updateFormState]),
        handleDescChange: useCallback(
            (e) => updateField('shortDescription', e.target.value, 'description'),
            [updateField]
        ),
        handleSpecsChange: useCallback((e) => updateField('technicalSpecs', e.target.value), [updateField])
    }
}

const useCleanUpPreview = (imageFile, previewUrl) => {
    useEffect(
        () => () => {
            if (imageFile) {
                globalThis.URL.revokeObjectURL(previewUrl)
            }
        },
        [imageFile, previewUrl]
    )
}

const useEquipmentForm = (equipment, onClose, onSuccess) => {
    const fileInputReference = useRef(null)
    const savedEquipmentReference = useRef(equipment)
    const [savedEquipment, setSavedEquipment] = useState(equipment)
    const isMounted = useRef(false)
    const isSubmittingReference = useRef(false)
    const [formState, updateFormState] = useSetState(() => getInitialFormState(equipment))

    const createEquipmentMutation = useCreateEquipment()
    const updateEquipmentMutation = useUpdateEquipment()
    const uploadImageMutation = useUploadEquipmentImage()

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    useCleanUpPreview(formState.imageFile, formState.previewUrl)

    const fieldHandlers = useEquipmentFieldHandlers(updateFormState)

    const handleImageChange = useCallback(
        (event) => {
            const selectedFile = event.target.files ? event.target.files[0] : null
            if (selectedFile) {
                updateFormState({
                    imageFile: selectedFile,
                    previewUrl: globalThis.URL.createObjectURL(selectedFile),
                    errorMessage: ''
                })
            }
        },
        [updateFormState]
    )

    const handleUploadClick = useCallback(() => {
        fileInputReference.current?.click()
    }, [])

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            if (isSubmittingReference.current) {
                return
            }

            const clientErrors = parseClientErrors(formState)
            if (Object.keys(clientErrors).length > 0) {
                updateFormState({ touched: ALL_TOUCHED })
                return
            }

            isSubmittingReference.current = true
            updateFormState({ isSubmitting: true, errorMessage: '', serverErrors: {} })
            const currentEquipment = savedEquipmentReference.current
            const isEditMode = Boolean(currentEquipment?.id)
            const payload = createEquipmentPayload(formState, currentEquipment, isEditMode)

            try {
                const saved = await executeSave({
                    isEditMode,
                    currentEquipment,
                    payload,
                    createMutation: createEquipmentMutation,
                    updateMutation: updateEquipmentMutation
                })
                savedEquipmentReference.current = saved
                setSavedEquipment(saved)

                const uploadOk = await tryUploadImage({
                    uploadMutation: uploadImageMutation,
                    equipmentId: saved?.id,
                    file: formState.imageFile,
                    onSuccess,
                    isMounted,
                    updateFormState
                })

                if (uploadOk && isMounted.current) {
                    onSuccess()
                    onClose()
                }
            } catch (error) {
                if (isMounted.current) {
                    const serverErrors = extractServerErrors(error)
                    const fallbackMessage = (error && error.message) || 'Failed to save equipment asset'
                    updateFormState({
                        serverErrors,
                        errorMessage: serverErrors.serial_no || fallbackMessage
                    })
                }
            } finally {
                isSubmittingReference.current = false
                if (isMounted.current) {
                    updateFormState({ isSubmitting: false })
                }
            }
        },
        [
            createEquipmentMutation,
            formState,
            onClose,
            onSuccess,
            updateEquipmentMutation,
            updateFormState,
            uploadImageMutation
        ]
    )

    const isSubmitting =
        formState.isSubmitting ||
        createEquipmentMutation.isPending ||
        updateEquipmentMutation.isPending ||
        uploadImageMutation.isPending

    return {
        formState,
        savedEquipment,
        savedEquipmentReference,
        fileInputReference,
        isSubmitting,
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
    const {
        formState,
        savedEquipment,
        fileInputReference,
        isSubmitting,
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

    const isEditMode = Boolean(savedEquipment?.id || equipment?.id)
    const clientErrors = useMemo(() => parseClientErrors(formState), [formState])

    const {
        equipmentName,
        modelCode,
        serialNumber,
        categoryId,
        shortDescription,
        technicalSpecs,
        previewUrl,
        errorMessage,
        serverErrors,
        touched,
        isCategoryOpen
    } = formState

    const nameError = resolveFieldError(touched.equipmentName, clientErrors.equipmentName, serverErrors.name)
    const categoryError = resolveFieldError(touched.categoryId, clientErrors.categoryId, serverErrors.category)
    const descriptionError = resolveFieldError(
        touched.shortDescription,
        clientErrors.shortDescription,
        serverErrors.description
    )

    const isFormValid = Object.keys(clientErrors).length === 0
    const activeErrorMessage = resolveActiveError(errorMessage, touched, clientErrors)

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

                    {activeErrorMessage ? (
                        <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                            {activeErrorMessage}
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
