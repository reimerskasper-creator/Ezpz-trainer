package com.ezpz.fitness

import java.io.*
import org.junit.Assert.*
import org.junit.Test

class BackupFileTest {
    private val bytes = "{\"logs\":[],\"weights\":[],\"name\":\"Kasper · æøå\"}\n".toByteArray(Charsets.UTF_8)
    @Test fun writesClosesAndVerifiesExactUtf8Bytes() {
        var closed = false
        val output = object : ByteArrayOutputStream() { override fun close() { closed=true; super.close() } }
        assertEquals(bytes.size,BackupFile.save(bytes,{output},{assertTrue(closed);ByteArrayInputStream(output.toByteArray())}))
        assertArrayEquals(bytes,output.toByteArray())
    }
    @Test fun realFileRoundTripPreservesBackupBytes() {
        val file=java.nio.file.Files.createTempFile("ezpz-backup-test", ".json").toFile()
        try {
            assertEquals(bytes.size,BackupFile.save(bytes,{file.outputStream()},{file.inputStream()}))
            assertArrayEquals(bytes,file.readBytes())
        } finally { file.delete() }
    }
    @Test fun failedWritesCloseAndNeverOpenVerification() {
        var closed=false
        val out=object : OutputStream() { override fun write(b:Int) { throw IOException("full") }; override fun close(){closed=true} }
        try { BackupFile.save(bytes,{out},{fail("must not verify failed write");null});fail("must fail") } catch (_: IOException) { }
        assertTrue(closed)
    }
    @Test fun missingStreamsCorruptionAndCloseFailureNeverReportSuccess() {
        for (mode in 0..3) {
            val out=object : ByteArrayOutputStream() { override fun close() { if(mode==3) throw IOException("close failed") } }
            try {
                BackupFile.save(bytes,{if(mode==0)null else out},{if(mode==1)null else ByteArrayInputStream(byteArrayOf(0))})
                fail("must fail")
            } catch (_: IOException) { }
        }
    }
}
