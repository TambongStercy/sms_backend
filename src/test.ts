import { generateReportCard } from './script'


generateReportCard(2, 1)
.then(data => console.log(data))
.catch(error => console.error(error))
.finally(() => console.log('done'))