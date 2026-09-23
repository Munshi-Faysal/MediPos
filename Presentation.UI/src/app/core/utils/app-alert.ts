import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

export interface AppConfirmOptions {
  title?: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
  confirmButtonColor?: string;
}

function getAlertPresentation(message: string): { icon: SweetAlertIcon; title: string } {
  const normalizedMessage = message.toLowerCase();

  if (/success|saved|created|updated|deleted|completed/.test(normalizedMessage)) {
    return { icon: 'success', title: 'Success' };
  }

  if (/fail|error|unable|invalid|not found|conflict/.test(normalizedMessage)) {
    return { icon: 'error', title: 'Something went wrong' };
  }

  if (/please|required|select|at least|missing|must /.test(normalizedMessage)) {
    return { icon: 'warning', title: 'Attention' };
  }

  return { icon: 'info', title: 'Notice' };
}

export function showAppAlert(
  message: unknown,
  icon?: SweetAlertIcon,
  title?: string
): Promise<SweetAlertResult> {
  const text = String(message ?? '');
  const presentation = getAlertPresentation(text);

  return Swal.fire({
    icon: icon ?? presentation.icon,
    title: title ?? presentation.title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#6d28d9',
    allowOutsideClick: true,
    heightAuto: false,
    customClass: {
      popup: 'medipos-swal',
      confirmButton: 'medipos-swal-confirm'
    }
  });
}

export async function confirmAppAction(options: AppConfirmOptions): Promise<boolean> {
  const result = await Swal.fire({
    icon: options.icon ?? 'warning',
    title: options.title ?? 'Are you sure?',
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText ?? 'Yes, continue',
    cancelButtonText: options.cancelButtonText ?? 'Cancel',
    confirmButtonColor: options.confirmButtonColor ?? '#dc2626',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusCancel: true,
    heightAuto: false,
    customClass: {
      popup: 'medipos-swal',
      confirmButton: 'medipos-swal-confirm',
      cancelButton: 'medipos-swal-cancel'
    }
  });

  return result.isConfirmed;
}

/**
 * Keeps legacy and third-party alert calls consistent with the application UI.
 * Native alert returns void, so replacing it with this non-blocking modal is safe.
 */
export function installGlobalSweetAlerts(): void {
  if (typeof window === 'undefined') return;

  window.alert = (message?: unknown): void => {
    void showAppAlert(message);
  };
}
