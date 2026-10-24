# Architecture

- Keep section spacing centralized in the design-system `Section` wrapper so adjacent sections cannot accumulate duplicate vertical gaps.
- Store timeline availability on each wedding and gate all timeline SELECTs with a restrictive RLS policy; use the shared database administrator check for preview access so public endpoints cannot bypass release.