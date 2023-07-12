/**
 * @jest-environment jsdom
 */

import 'jquery'
import 'bootstrap'

// TESTING LIBRARIES -------------------------------------
import '@testing-library/jest-dom'
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

// MOCKS -------------------------------------------------
import mockStore from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

// ROUTER ------------------------------------------------
import { ROUTES } from "../constants/routes.js"

// TESTED MODULES ----------------------------------------
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

jest.mock("../app/Store", () => mockStore)

// TESTS ===============================================
describe("Given I am connected as an employee and I am on NewBill Page", () => {

  beforeEach(() => {
    jest.spyOn(mockStore, "bills")

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
    }))

    document.body.innerHTML = NewBillUI()
  })

  describe("When I choose a file with the right format and the upload fails with error 404", () => {

    test("Then the console should return the error message 404", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      new NewBill({ document, onNavigate, store: mockStore, localStorage })

      await waitFor(() => screen.getByTestId('file'))
      const inputFile = screen.getByTestId('file')

      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const test_file = new File([''], 'test.jpg', {type: 'image/jpeg'})
      userEvent.upload(inputFile, test_file)

      // TESTED VALUES ----------------------------------------
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled()
        expect(consoleError.mock.calls[0][0].message).toBe('Erreur 404')
      })

      consoleError.mockRestore()
    })
  })

  describe("When I choose a file with the right format and the upload fails with error 500", () => {

    test("Then the console should return the error message 500", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      new NewBill({ document, onNavigate, store: mockStore, localStorage })

      await waitFor(() => screen.getByTestId('file'))
      const inputFile = screen.getByTestId('file')

      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const test_file = new File([''], 'test.jpg', {type: 'image/jpeg'})
      userEvent.upload(inputFile, test_file)

      // TESTED VALUES ----------------------------------------
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled()
        expect(consoleError.mock.calls[0][0].message).toBe('Erreur 500')
      })

      consoleError.mockRestore()
    })
  })
})
