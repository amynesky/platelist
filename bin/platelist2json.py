#!/usr/bin/env python

"""
Convert a platelist.fits file into JSON tabular format to be read by
datatables and d3.

Note: this also trims down the number of significant digits -- it is designed
for quick web viewing without additional parsing rather than as an original
authoritative datasource.  Future versions of the platelist webapp could
parse directly from the original platelist files instead.

Stephen Bailey
January 2014
"""

import sys
import numpy as np

## import fitsio
## platelist = fitsio.read(sys.argv[1])

import pyfits
platelist = pyfits.getdata(sys.argv[1])

#- Trim for testing
# platelist = platelist[0:20]

columns = platelist.dtype.names
# columns = ('PLATE',
#  'TILEID',
#  'MJD',
#  'RUN2D',
#  'RUN1D',
#  'RACEN',
#  'DECCEN',
#  'AIRMASS',
#  'SURVEY',
#  'PROGRAMNAME',
#  'PLATEQUALITY',
#  'PLATESN2',
#  'DEREDSN2',
#  'NEXP',
#  'DERED_SN2_G1',
#  'DERED_SN2_I1',
#  'DERED_SN2_G2',
#  'DERED_SN2_I2',
#  'FBADPIX',
#  'SUCCESS_MAIN',
#  'SUCCESS_LRG1',
#  'SUCCESS_LRG2',
#  'SUCCESS_QSO',
#  'STATUS2D',
#  'STATUSCOMBINE',
#  'STATUS1D',
#  'PUBLIC',
#  'QUALCOMMENTS')


#- Sigh, JSON won't allow trailing commas, so do hacky last element caching
lastcol = columns[-1]

print '{ "aaData":'
print "["
for i in range(len(platelist)):
    row = platelist[i]
    print "  {",
    for col in columns:
        value = row[col]
        if isinstance(value, str):
            value = '"' + value.strip() + '"'
        elif isinstance(value, (int, np.int32, np.int64)):
            value = str(value)
        else:
            value = '%.2f' % value
            
        if col != lastcol:
            print '"%s": %s,' % (col, value),
        else:
            print '"%s": %s' % (col, value),
    
    if i < len(platelist)-1:
        print "},"
    else:
        print "}"
        
print "]"
print "}"

