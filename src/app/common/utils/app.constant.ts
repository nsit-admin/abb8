export const appConstants = {
    formPatterns: {
        alphabets: '^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$',
        mobile: '^((\\+91-?)|0)?[0-9]{10}$',
        email: '^[A-Za-z0-9._%+-]{1,}@[a-zA-Z0-9]{2,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})$',
        password: '^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$'
    },
    registerConfirm: 'An email has been sent to your email address. ' +
        'Please check your email and click on the link provided to complete your registration',
    forgotConfirm: 'An email has been sent to your email address. ' +
        'Please check your email and click on the link provided to reset your password',
    pwdSuccess: 'Password Updated Successfully',
    logoutSuccess: 'Successfully Logged out',
    inValidEmail: 'Email doesnt exists',
    pwdUpdateFail: 'Password not updated successfully. Something went wrong',
    toaster: {
        rightClassName: 'toast-bottom-right',
        centerClassName: 'toast-bottom-center',
        documentEditSuccess: 'Document has been edited successfully',
        documentEditConfirmSuccess: 'Document has been saved & submitted successfully',
        documentEditError: 'Unable to edit Document',
        documentGetError: 'Unable to get Document',
        doucmentUploadError: 'Upload Document Failed',
        documentMergeSuccess: 'Document Merged successfully',
        documentMergeError: 'There was a problem while merging',
        activateUserSuccess: 'Your account is activated successfully. Please login to access.',
        activateUserError: 'There was a problem. Please try again later.',
        mergeStatus: 'Documents are being merged in the backend. Please wait and try again after sometime',
        resyncRequired: 'Documents are outdated. Please resync changes before reviewing',
        documentMergeStatus: 'Document is being merged in the backend. Please wait and try again after sometime',
        documentUploadSuccess: 'Document Upload successfully',
        createDocuFileNameReq: 'Please enter the File Name',
        createDocuContentReq: 'Please enter the document',
        createDocumentSuccess: 'Document Created successfully',
        createDocumentError: 'Document Created Failed',
        mergeNotCompleted: 'Document compare process is going on. Please check after some time',
        createDocumentValidation: 'Please enter File Name and document fields',
    },
    route: {
        emailConfirm: '/emailconfirm',
        dashboard: '/pages/dashboard',
       // documentDashboard: '/pages/dash-document',
        documentDashboard: '/pages/document-dashboard',
        documentEdit: '/pages/document-edit',
        login: '/login',
        forgotParam: 'forgot',
        logoutParam: 'logout',
        resetParam: 'reset',
        mergeDocument: '/pages/merge-document',
    },
    docList: 'docList',
    Inprogress: 'Inprogress',
    Completed: 'Completed',
    Outdated: 'Outdated',
    DOCX:'docx',
    MASTER:'Master'
};
