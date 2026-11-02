import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import App from './App.jsx';

beforeEach(()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({items:[]})}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('case creation landing page',()=>{
 it('shows the mystery-room introduction and fictional premise field',()=>{render(<MemoryRouter><App/></MemoryRouter>);expect(screen.getByText(/THE ART OF DEDUCTION/i)).toBeTruthy();expect(screen.getByPlaceholderText(/old observatory/i)).toBeTruthy();});
 it('keeps generation disabled until the scenario reaches 30 characters',async()=>{const user=userEvent.setup();render(<MemoryRouter><App/></MemoryRouter>);const field=screen.getByPlaceholderText(/old observatory/i),button=screen.getByRole('button',{name:/Generate case/i});await user.type(field,'A short fictional mystery scene');expect(field.value.length).toBeGreaterThanOrEqual(30);expect(button.disabled).toBe(false);await user.clear(field);await user.type(field,'Too short');expect(button.disabled).toBe(true);});
 it('offers the requested title preference, difficulty, and evidence intensity options',()=>{render(<MemoryRouter><App/></MemoryRouter>);expect(screen.getByPlaceholderText('The Midnight Archive')).toBeTruthy();expect(screen.getByLabelText(/Difficulty/i)).toBeTruthy();expect(screen.getByLabelText(/Evidence intensity/i)).toBeTruthy();});
});
import React from 'react';
