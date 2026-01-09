import { createCRUDService } from '../../utils/createApi'
import apiClient from '../index'

export const fileSharingFilesApi = createCRUDService('/api/fileSharingFiles')