import { createElement } from 'lwc';
import Ccp2_VehicleCertificateUpload from 'c/ccp2_VehicleCertificateUpload';

describe('c-ccp2-vehicle-certificate-upload', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-ccp2-vehicle-certificate-upload', {
            is: Ccp2_VehicleCertificateUpload
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});