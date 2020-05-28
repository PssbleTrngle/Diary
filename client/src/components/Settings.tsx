import { faFire, faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

export interface ISettings {
    theme: string;
}

export const DEFAULT_SETTINGS = { theme: 'dark' }

const SettingsContext = createContext<[ISettings, Dispatch<SetStateAction<ISettings>>]>(
    [DEFAULT_SETTINGS, () => { }]
);

/**
 * einstellbare Settings: Farbethema der Icons
 */
const Settings = () => {
    const [, setSettings] = useContext(SettingsContext);

    const themes: [string, IconDefinition][] = [
        ['dark', faMoon],
        ['light', faSun],
        ['red', faFire],
    ];

    return <div className='settings'>

        <h1>Settings</h1>

        <ul>
            {themes.map(([theme, icon]) =>
                <button key={theme} className='icon-button' onClick={() => setSettings(s => ({ ...s, theme }))}>
                    <Icon {...{ icon }} />
                </button>
            )}
        </ul>
    </div>
}

export function useSettings() {
    const saved = localStorage.getItem('settings')
    const defaultSettings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;

    const [settings, setSettings] = useState<ISettings>(defaultSettings)

    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings));
    }, [settings])

    return [settings, setSettings] as [ISettings, Dispatch<SetStateAction<ISettings>>];
}

export const Provider = SettingsContext.Provider;

export default Settings;