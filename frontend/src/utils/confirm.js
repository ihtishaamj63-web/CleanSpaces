// Shared SweetAlert2 wrappers so no page calls native alert()/confirm()
// (module requirement: blocking browser dialogs are disallowed).
import Swal from 'sweetalert2'

// Replacement for confirm(): resolves true/false.
export function askConfirm(title, text = '') {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#176b3a',
    cancelButtonColor: '#8a978f',
    confirmButtonText: 'Yes, continue'
  }).then((result) => result.isConfirmed)
}

// Replacement for alert(): informational popup.
export function toastInfo(title, text = '') {
  return Swal.fire({ title, text, icon: 'info', confirmButtonColor: '#176b3a' })
}

export function toastError(title, text = '') {
  return Swal.fire({ title, text, icon: 'error', confirmButtonColor: '#176b3a' })
}