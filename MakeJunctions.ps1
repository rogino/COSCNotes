# Makes Junctions from $OutputDirectory/ABCD123/$SubPath to $OutputDirectory/ABCD123
# Allows notes synced via OneDrive to be in a Git repo as well

[CmdletBinding()]
Param(
  [Parameter(Mandatory=$true)]
  [String]$SourceDirectory,

  [Parameter(Mandatory=$true)]
  [String]$OutputDirectory,

  [Parameter(Mandatory=$false)]
  [String]$SubPath="Notes"
)

# Write-Output $var | Select-Object -Property * # print out all properties
# vim> g_ goes to end of line excluding the newline
Foreach($dir in Get-ChildItem -Path $SourceDirectory) {
  If ($dir.Name -match "[A-Z]{4}\d{3}") {
    $inputDir = Join-Path -Path $dir.FullName -ChildPath $SubPath
    $outputDir = Join-Path -Path (Resolve-Path $OutputDirectory) -ChildPath $dir.Name
    if ((Test-Path $inputDir) -And -Not (Test-Path $outputDir)) {
      New-Item -ItemType Junction -Path $outputDir -Value $inputDir
      Write-Output "$outputDir <==> $inputDir"
    }
  }
}
