import Swal from 'sweetalert2';

// Diálogo interactivo de confirmación SweetAlert2 totalmente compatible con tema oscuro
export const confirmAction = async ({
    title = '¿Estás seguro?',
    text = '',
    icon = 'question', // 'question', 'warning', 'info', 'success', 'error'
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar',
    confirmButtonClass = 'btn btn-primary btn-sm'
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        background: '#161b22',
        color: '#c9d1d9',
        customClass: {
            popup: 'custom-swal-popup glass-card',
            title: 'custom-swal-title',
            htmlContainer: 'custom-swal-text',
            confirmButton: `${confirmButtonClass} custom-swal-btn`,
            cancelButton: 'btn btn-ghost btn-sm custom-swal-btn',
        },
        buttonsStyling: false,
        reverseButtons: true,
        focusCancel: false,
        allowOutsideClick: true,
        allowEscapeKey: true
    });

    return result.isConfirmed;
};
