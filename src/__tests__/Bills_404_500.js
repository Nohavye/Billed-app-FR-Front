/**
 * @jest-environment jsdom
 */

// TESTING LIBRARIES -------------------------------------
import { screen, waitFor } from "@testing-library/dom"

// MOCKS -------------------------------------------------
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"

// ROUTER ------------------------------------------------
import router from "../app/Router"
import { ROUTES_PATH } from "../constants/routes"

jest.mock("../app/Store", () => mockStore)

// TESTS ===============================================
describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
  
    describe("When an error occurs on API", () => {

      beforeEach(() => {
        jest.spyOn(mockStore, "bills")

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
        }))

        document.body.innerHTML = `
          <div id="root"></div>
        `
        router()
      })

      test("Fetches bills from API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)

        await waitFor(() => screen.getByText(/Erreur 404/))
        const error_message = screen.getByText(/Erreur 404/)
        
        expect(error_message).toBeTruthy()
      })

      test("Fetches bills from API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)

        await waitFor(() => screen.getByText(/Erreur 500/))
        const error_message = screen.getByText(/Erreur 500/)

        expect(error_message).toBeTruthy()
      })
    })
  })
})

