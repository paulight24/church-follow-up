import type { AxiosResponse } from 'axios';
import type { MyProfile, UpdateMyProfileRequest } from '@/types/profile';
import api from '@/config/api';

export interface ProfileOptions {
  departments: Array<{ id: string; name: string }>;
  cellGroups: Array<{ id: string; name: string }>;
}

export const profileApi = {
  /**
   * GET /profile/me/options — the church's departments and cell groups, id
   * and name only. A separate endpoint from /departments because the MEMBER
   * role deliberately cannot read those (they carry rosters).
   */
  getMyOptions(): Promise<AxiosResponse<ProfileOptions>> {
    return api.get('/profile/me/options');
  },

  /** GET /profile/me — permission `profile.view_own`. */
  getMyProfile(): Promise<AxiosResponse<MyProfile>> {
    return api.get('/profile/me');
  },

  /**
   * PATCH /profile/me — permission `profile.update_own`. Updates ONLY the
   * caller's own member record. The backend schema is `.strict()`, so only
   * ever send keys from `UpdateMyProfileRequest`.
   */
  updateMyProfile(data: UpdateMyProfileRequest): Promise<AxiosResponse<MyProfile>> {
    return api.patch('/profile/me', data);
  },
};
