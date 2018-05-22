import * as React from 'react';
import { Preloader } from './ui';
import { IState } from '../App';

interface ILoginPage {
  store: IState;
  toggleState: (newState: object) => void;
  getSettings: () => void;
  validateLoginPassword: () => void;
}

class LoginPage extends React.Component<ILoginPage, any> {

  public async componentDidMount() {
    await this.props.getSettings();
  }

  public render() {
    const { saving, login, password, errorRemoteSettings, errorValidation } = this.props.store;
    return (
      <div className={'login-wrong'}>
        <div className='login-wrap'>
          <section>
            <div className='login-logo'>
              <img src='image/logo.svg' alt='Omnicomm Port' />
            </div>
            <div className='section_content'>
              <form onSubmit={async (e) => {
                await e.preventDefault();
                await this.props.validateLoginPassword();
              }}>
                <div className='section_content_inner'>
                  <div className='tab-content'>
                    <div className='tab-content_item'>
                      <div className='row'>
                        <div className='col-md-12 col-xl-12'>
                          <div className='form-group_inner'>
                            <label htmlFor=' '>Логин</label>
                            <input
                              onChange={(e) => this.props.toggleState({ login: e.target.value })}
                              value={login}
                              id={'login'}
                              type='text'
                              autoComplete={'username'}
                            />
                          </div>
                        </div>
                        <div className='col-md-12 col-xl-12'>
                          <div className='form-group_inner'>
                            <label htmlFor=' '>Пароль</label>
                            <input
                              onChange={(e) => this.props.toggleState({ password: e.target.value })}
                              value={password}
                              id={'password'}
                              type='password'
                              autoComplete={'current-password'}
                            />
                          </div>
                        </div>
                        <div className='col-md-12 col-xl-12'>
                          <div className='form-group_inner'>
                            <input
                              type='submit'
                              className='btn btn-primary'
                              value='Войти'
                              id={'submit'}
                              onClick={this.props.validateLoginPassword}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  errorRemoteSettings || errorValidation ?
                    <div className='login_wrong-pass'>
                      <div className='wrong-pass_title'>
                        {errorRemoteSettings ? 'Не удалось считать настройки' : 'Неверный логин или пароль'}
                      </div>
                    </div> : null
                }
              </form>
            </div>
          </section>
        </div>
        <Preloader saving={saving} />
      </div>
    );
  }
}

export default LoginPage;
