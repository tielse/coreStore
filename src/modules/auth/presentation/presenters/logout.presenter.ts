/**
 * Logout Presenter (Presentation layer)
 * Trách nhiệm: format logout response để trả về client
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutPresenter {
  present(): Record<string, any> {
    return {
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };
  }
}
