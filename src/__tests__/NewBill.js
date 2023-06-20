/**
 * @jest-environment jsdom
 */

import 'jquery'
import 'bootstrap'

// TESTING LIBRARIES -------------------------------------
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

// MOCKS -------------------------------------------------
import storeMock from "../__mocks__/store.js"
import storeMockBadFile from "../__mocks__/store_bad.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

// ROUTER ------------------------------------------------
import { ROUTES } from "../constants/routes.js"

// TESTED MODULES ----------------------------------------
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

// COMMON INITIAL CONDITIONS ----------------------------
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'employee@test.tld'
}))

// TESTS ===============================================
describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    test("Then when I choose a file and the upload fails.", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      new NewBill({ document, onNavigate, store: storeMockBadFile, localStorage })

      await waitFor(() => screen.getByTestId('file'))
      const inputFile = screen.getByTestId('file')

      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const test_file = new File([''], 'test.jpg', {type: 'image/jpg'})
      userEvent.upload(inputFile, test_file)

      // TESTED VALUES ----------------------------------------
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled()
        expect(consoleError.mock.calls[0][0]).toBe('Invalid file format')
      })

      consoleError.mockRestore()
    })
    
    test("Then when I choose a file and it uploaded successfully.", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newbill = new NewBill({ document, onNavigate, store: storeMock, localStorage })

      await waitFor(() => screen.getByTestId('file'))
      const inputFile = screen.getByTestId('file')

      const consoleLog = jest.spyOn(console, 'log').mockImplementation()

      const test_file = new File([''], 'test.jpg', {type: 'image/jpeg'})
      userEvent.upload(inputFile, test_file)

      // TESTED VALUES ----------------------------------------
      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalled()
        expect(consoleLog.mock.calls[0][0]).toBe('https://localhost:3456/images/test.jpg')
        newbill.billId = 1234
        newbill.fileUrl = 'https://localhost:3456/images/test.jpg'
        newbill.fileName = 'test.jpg'
      })

      consoleLog.mockRestore()
    })

    test("Then when I complete the form correctly and submit it.", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newbill = new NewBill({ document, onNavigate, store: storeMock, localStorage })

      await waitFor(() => screen.getByText('Envoyer'))
      const submitbutton = screen.getByText('Envoyer')
      const inputFile = screen.getByTestId('file')

      const consoleLog = jest.spyOn(console, 'log').mockImplementation()

      const test_file = new File([''], 'test.jpg', {type: 'image/jpg'})
      userEvent.upload(inputFile, test_file)

      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Transports')
      screen.getByTestId('expense-name').value = 'expense-name'
      screen.getByTestId('amount').value = '30'
      screen.getByTestId('datepicker').value = '2023-06-01'
      screen.getByTestId('vat').value = '20'
      screen.getByTestId('pct').value = '70'
      screen.getByTestId('commentary').value = 'commentary'

      userEvent.click(submitbutton)

      // TESTED VALUES ----------------------------------------
      await waitFor(() => {
        // expect(consoleLog).toBeCalled()
        expect(consoleLog).toHaveBeenCalled()
        expect(consoleLog.mock.calls[0][1]).toBe(
          '2023-06-01'
        )
        newbill.billId = 1234
        newbill.fileUrl = 'https://localhost:3456/images/test.jpg'
        newbill.fileName = 'test.jpg'
      })

      consoleLog.mockRestore()
    })
  })
})
