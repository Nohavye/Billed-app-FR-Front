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
import storeBadDateMock from "../__mocks__/store_bad.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

// ROUTER ------------------------------------------------
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

// TESTED MODULES ----------------------------------------
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills as databills } from "../fixtures/bills.js"

// COMMON INITIAL CONDITIONS ----------------------------
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
}))

// TESTS ===============================================
describe("Given I am connected as an employee", () => {
    
    describe("When I am on Bills Page", () => {
        
        test("Then bill icon in vertical layout should be highlighted", async () => {

            document.body.innerHTML = `
                <div id="root"></div>
            `
            router()
            window.onNavigate(ROUTES_PATH['Bills'])
            
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')

            // TESTED VALUES ----------------------------------------
            expect(windowIcon.classList.contains('active-icon')).toBe(true)
        })
        
        test("Then bills should be ordered from earliest to latest", () => {
            
            document.body.innerHTML = BillsUI({ data: databills })

            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)

            // TESTED VALUES ----------------------------------------
            expect(dates).toEqual(datesSorted)
        })
        
        test("=> Then the 'new bill' button should be present", async () => {
            
            document.body.innerHTML = BillsUI({ data: databills })
            
            const btnId = 'btn-new-bill'
            await waitFor(() => screen.getByTestId(btnId))

            // TESTED VALUES ----------------------------------------
            expect(screen.getByTestId(btnId)).toBeTruthy()
        })
        
        test("=> Then when I click on the 'new bill' button the 'new bill' page comes up", async () => {
            document.body.innerHTML = `
              <div id="root"></div>
            `
            router()
            window.onNavigate(ROUTES_PATH['Bills'])
            
            document.getElementById('root').innerHTML = BillsUI({ data: databills })
            new Bills({ document, onNavigate, store: storeMock, localStorage })
      
            await waitFor(() => screen.getByTestId('btn-new-bill'))
            const btn = screen.getByTestId('btn-new-bill')

            userEvent.click(btn)

            // TESTED VALUES ----------------------------------------
            await waitFor(() => {
              expect(document.documentURI).toEqual('http://localhost/#employee/bill/new')
            })
        })

        test("=> Then, when I click on the eye icon, the proof modal is displayed", async () => {
            document.body.innerHTML = `
                <div id="root"></div>
            `
            router()
            window.onNavigate(ROUTES_PATH['Bills'])
            
            document.getElementById('root').innerHTML = BillsUI({ data: databills })
            new Bills({ document, onNavigate, store: storeMock, localStorage })

            await waitFor(() => screen.getAllByTestId('icon-eye'))
            await waitFor(() => screen.getByTestId('modaleFile'))
            const icon = screen.getAllByTestId('icon-eye')[0]
            const modaleFile = screen.getByTestId('modaleFile')

            userEvent.click(icon)

            // TESTED VALUES ----------------------------------------
            await waitFor(() => {
                expect(modaleFile.classList.contains('show')).toBe(true);
            })

            expect(modaleFile.style.display).toEqual('block')
        })

        test("=> Then, when the returned data is correct, the table of saved bills is displayed.", async () => {
          document.body.innerHTML = `
            <div id="root"></div>
          `
          const rootDiv = document.getElementById('root')
          const bills = new Bills({ document, onNavigate, store: storeMock, localStorage  })
          const consoleLog = jest.spyOn(console, 'log').mockImplementation()

          bills.getBills().then(data => {
            rootDiv.innerHTML = BillsUI({ data })
          }).catch(error => {
            rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Bills'], error })
          })

          // TESTED VALUES ----------------------------------------
          await waitFor(() => {
            expect(rootDiv.innerHTML).not.toEqual('')
            expect(consoleLog).toHaveBeenCalled()

            expect(consoleLog.mock.calls[0]).toEqual(
              ['length', 4]
            )
          })

          consoleLog.mockRestore()
        })

        test("=> Then, when the data returned has incorrect dates, the table of saved bills is displayed with the dates unformatted.", async () => {
          document.body.innerHTML = `
            <div id="root"></div>
          `
          const rootDiv = document.getElementById('root')
          const bills = new Bills({ document, onNavigate, store: storeBadDateMock, localStorage  })
          const consoleLog = jest.spyOn(console, 'log').mockImplementation()

          bills.getBills().then(data => {
            rootDiv.innerHTML = BillsUI({ data })
          }).catch(error => {
            rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Bills'], error })
          })

          // TESTED VALUES ----------------------------------------
          await waitFor(() => {
            expect(rootDiv.innerHTML).not.toEqual('')
            expect(consoleLog).toHaveBeenCalled()

            expect(consoleLog.mock.calls[0][0]).toEqual(
              RangeError('Invalid time value')
            )

            expect(consoleLog.mock.calls[1]).toEqual(
              ['length', 4]
            )
          })

          consoleLog.mockRestore()
        })
    })
})
